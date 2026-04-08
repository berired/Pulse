import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,txt,png,jpg,jpeg,gif,zip').split(',');
  const fileExt = path.extname(file.originalname).slice(1).toLowerCase();

  if (allowedTypes.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${fileExt} not allowed`), false);
  }
};

const limits = {
  fileSize: parseInt(process.env.MAX_FILE_SIZE || 52428800), // 50MB default
};

export const upload = multer({
  storage,
  fileFilter,
  limits,
});

/**
 * Upload a file to Supabase Storage and create record in documents table
 */
export const uploadFile = async (req, res, supabase, userId) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { module, context } = req.body;
    const file = req.file;

    if (!module) {
      return res.status(400).json({ error: 'Module type is required' });
    }

    // Generate unique filename
    const fileId = uuidv4();
    const fileExt = path.extname(file.originalname);
    const fileName = `${fileId}${fileExt}`;
    const filePath = `${module}/${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // Create document record in database
    const { data: documentData, error: dbError } = await supabase
      .from('documents')
      .insert([
        {
          file_name: file.originalname,
          file_path: filePath,
          file_size: file.size,
          file_type: file.mimetype,
          storage_url: publicUrl,
          uploaded_by: userId,
          module,
          context,
        },
      ])
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    res.status(201).json({
      id: documentData.id,
      fileName: documentData.file_name,
      fileSize: documentData.file_size,
      fileType: documentData.file_type,
      url: documentData.storage_url,
      uploadedAt: documentData.created_at,
      module: documentData.module,
    });
  } catch (error) {
    console.error('[Upload] Error:', error.message);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message,
    });
  }
};

/**
 * Get all documents for a user
 */
export const getUserDocuments = async (req, res, supabase, userId) => {
  try {
    const { module, limit = 20, offset = 0 } = req.query;

    let query = supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('uploaded_by', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (module) {
      query = query.eq('module', module);
    }

    const { data, count, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    res.json({
      documents: data,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('[Get Documents] Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch documents',
      message: error.message,
    });
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (req, res, supabase, userId) => {
  try {
    const { documentId } = req.params;

    // Get document to verify ownership and get file path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('uploaded_by', userId)
      .single();

    if (fetchError || !document) {
      return res.status(404).json({
        error: 'Document not found',
        message: 'Document does not exist or you do not have permission to delete it',
      });
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([document.file_path]);

    if (storageError) {
      console.warn('Storage deletion warning:', storageError.message);
    }

    // Delete database record
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (dbError) {
      throw new Error(dbError.message);
    }

    res.json({
      success: true,
      message: 'Document deleted successfully',
      id: documentId,
    });
  } catch (error) {
    console.error('[Delete Document] Error:', error.message);
    res.status(500).json({
      error: 'Delete failed',
      message: error.message,
    });
  }
};

/**
 * Get document details
 */
export const getDocument = async (req, res, supabase, userId) => {
  try {
    const { documentId } = req.params;

    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error || !document) {
      return res.status(404).json({
        error: 'Document not found',
      });
    }

    // Verify user has access (uploaded it or has role-based access)
    if (document.uploaded_by !== userId) {
      // Can add role-based access control here
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    res.json(document);
  } catch (error) {
    console.error('[Get Document] Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch document',
      message: error.message,
    });
  }
};
