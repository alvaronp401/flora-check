const axios = require('axios');

async function validateEmail(email) {
  const apiKey = process.env.ABSTRACT_EMAIL_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ ABSTRACT_EMAIL_API_KEY não configurada. Pulando validação.');
    return { is_valid: true }; // Fallback seguro para não travar o usuário
  }

  try {
    const response = await axios.get(`https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`);
    
    // Abstract API retorna 'deliverability' como 'DELIVERABLE' para e-mails válidos
    const { deliverability, is_valid_format, is_disposable_email } = response.data;
    
    return {
      isValid: deliverability === 'DELIVERABLE' && is_valid_format.value,
      isDisposable: is_disposable_email.value,
      suggestion: response.data.autocorrect_suggestion
    };
  } catch (error) {
    console.error('❌ Erro Abstract API:', error.message);
    return { isValid: true }; // Se a API cair, deixamos passar para não perder a venda
  }
}

module.exports = { validateEmail };
