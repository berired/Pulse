import supabase from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

export const submitReport = async (req, res) => {
  try {
    const { title, date, description } = req.body;
    const userId = req.userId;

    // Validate user is authenticated
    if (!userId) {
      throw new AppError('Authentication required to submit report', 401);
    }

    // Validate required fields
    if (!title || !date || !description) {
      throw new AppError('Missing required fields', 400);
    }

    // Validate date format
    const reportDate = new Date(date);
    if (isNaN(reportDate.getTime())) {
      throw new AppError('Invalid date format', 400);
    }

    let imageUrl = null;
    
    // Handle file upload if image is provided
    if (req.file) {
      try {
        // Create unique filename with timestamp
        const timestamp = Date.now();
        const fileExt = req.file.originalname.split('.').pop();
        const fileName = `${title.replace(/\s+/g, '-').toLowerCase()}-${timestamp}.${fileExt}`;
        
        // Upload to Supabase storage
        const { data, error: uploadError } = await supabase
          .storage
          .from('reports')
          .upload(`reports/${fileName}`, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
          });

        if (uploadError) {
          throw new AppError(`Failed to upload image: ${uploadError.message}`, 400);
        }

        // Get public URL
        const { data: publicData } = supabase
          .storage
          .from('reports')
          .getPublicUrl(`reports/${fileName}`);
        
        imageUrl = publicData.publicUrl;
      } catch (uploadErr) {
        if (uploadErr instanceof AppError) throw uploadErr;
        throw new AppError('Image upload failed', 500);
      }
    }

    // Save report to database
    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        title,
        date: reportDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        description,
        image_url: imageUrl,
        user_id: userId,
        status: 'not_yet_reviewed',
      })
      .select('id')
      .single();

    if (error) throw new AppError(error.message, 400);

    res.json({ 
      success: true, 
      message: 'Report submitted successfully',
      reportId: report.id,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error submitting report:', error);
    throw new AppError('Failed to submit report', 500);
  }
};

export const getReports = async (req, res) => {
  try {
    const { status } = req.query;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    let query = supabase
      .from('reports')
      .select('*, profiles(username, avatar_url)', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: reports, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new AppError(error.message, 400);

    res.json({ 
      reports,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error fetching reports:', error);
    throw new AppError('Failed to fetch reports', 500);
  }
};

export const getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;

    const { data: report, error } = await supabase
      .from('reports')
      .select('*, profiles(username, avatar_url)')
      .eq('id', reportId)
      .single();

    if (error || !report) throw new AppError('Report not found', 404);

    res.json({ report });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error fetching report:', error);
    throw new AppError('Failed to fetch report', 500);
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, adminNotes } = req.body;

    // Validate status
    const validStatuses = ['not_yet_reviewed', 'reviewing', 'done'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const updateData = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }

    const { data: report, error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', reportId)
      .select()
      .single();

    if (error || !report) throw new AppError('Report not found', 404);

    res.json({ 
      success: true,
      message: 'Report status updated',
      report,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error updating report:', error);
    throw new AppError('Failed to update report', 500);
  }
};

export const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    // Get report to find image URL
    const { data: report, error: fetchError } = await supabase
      .from('reports')
      .select('image_url')
      .eq('id', reportId)
      .single();

    if (fetchError || !report) throw new AppError('Report not found', 404);

    // Delete image from storage if exists
    if (report.image_url) {
      try {
        const fileName = report.image_url.split('/').pop();
        await supabase.storage.from('reports').remove([`reports/${fileName}`]);
      } catch (storageErr) {
        console.warn('Failed to delete image from storage:', storageErr);
        // Continue with report deletion even if image deletion fails
      }
    }

    // Delete report from database
    const { error: deleteError } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId);

    if (deleteError) throw new AppError(deleteError.message, 400);

    res.json({ 
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error deleting report:', error);
    throw new AppError('Failed to delete report', 500);
  }
};
