import supabase from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

export const getCareplans = async (req, res) => {
  try {
    const userId = req.userId;
    const { templateType, isTemplate } = req.query;

    let query = supabase
      .from('care_plans')
      .select('*')
      .eq('user_id', userId);

    if (templateType) query = query.eq('template_type', templateType);
    if (isTemplate !== undefined) {
      query = query.eq('is_template', isTemplate === 'true');
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    throw error;
  }
};

export const createCareplan = async (req, res) => {
  try {
    const { patientName, medicalRecordNumber, templateType, content, isTemplate } =
      req.body;
    const userId = req.userId;

    if (!patientName && !isTemplate) {
      throw new AppError(
        'Patient name is required for non-template care plans',
        400
      );
    }

    const { data, error } = await supabase
      .from('care_plans')
      .insert({
        user_id: userId,
        patient_name: patientName,
        medical_record_number: medicalRecordNumber,
        template_type: templateType || 'assessment-plan',
        content: content || {},
        is_template: isTemplate || false,
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({
      success: true,
      message: 'Care plan created successfully',
      data,
    });
  } catch (error) {
    throw error;
  }
};

export const updateCareplan = async (req, res) => {
  try {
    const { id } = req.params;
    const { patientName, medicalRecordNumber, templateType, content } = req.body;
    const userId = req.userId;

    // Verify ownership
    const { data: careplan, error: fetchError } = await supabase
      .from('care_plans')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !careplan) {
      throw new AppError('Care plan not found', 404);
    }

    if (careplan.user_id !== userId) {
      throw new AppError(
        'Unauthorized: You can only edit your own care plans',
        403
      );
    }

    const { data, error } = await supabase
      .from('care_plans')
      .update({
        patient_name: patientName,
        medical_record_number: medicalRecordNumber,
        template_type: templateType,
        content,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      message: 'Care plan updated successfully',
      data,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteCareplan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verify ownership
    const { data: careplan, error: fetchError } = await supabase
      .from('care_plans')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !careplan) {
      throw new AppError('Care plan not found', 404);
    }

    if (careplan.user_id !== userId) {
      throw new AppError(
        'Unauthorized: You can only delete your own care plans',
        403
      );
    }

    const { error } = await supabase
      .from('care_plans')
      .delete()
      .eq('id', id);

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      message: 'Care plan deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};
