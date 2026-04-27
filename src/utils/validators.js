// src/utils/validators.js

// 強制轉大寫並去除越南語聲調
export const normalizeName = (str) => {
  if (!str) return '';
  let res = str.toUpperCase();
  res = res.replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, "A");
  res = res.replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, "E");
  res = res.replace(/[ÌÍỊỈĨ]/g, "I");
  res = res.replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, "O");
  res = res.replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, "U");
  res = res.replace(/[ỲÝỴỶỸ]/g, "Y");
  res = res.replace(/Đ/g, "D");
  res = res.replace(/[^A-Z\s]/g, ""); // 僅保留英文字母與空格
  return res.replace(/\s+/g, " ").trim();
};

// 檢查帳號是否為 6-20 位純數字
export const isValidAcc = (acc) => /^[0-9]{6,20}$/.test(acc);
