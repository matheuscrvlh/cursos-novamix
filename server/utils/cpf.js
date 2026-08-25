// Valida CPF de verdade (dígitos verificadores), não só formato — usado
// tanto no pagamento (o Mercado Pago rejeita CPF com checksum errado) quanto
// no cadastro de cliente.
function cpfValido(cpf) {
  const digits = (cpf || '').replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  const calcDV = base => {
    let sum = 0;
    let weight = base.length + 1;
    for (const d of base) sum += Number(d) * weight--;
    const resto = sum % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const base9 = digits.slice(0, 9).split('');
  const dv1 = calcDV(base9);
  const dv2 = calcDV([...base9, dv1]);

  return dv1 === Number(digits[9]) && dv2 === Number(digits[10]);
}

module.exports = { cpfValido };
