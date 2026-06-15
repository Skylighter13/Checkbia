function doGet(e) {
  var template = HtmlService.createTemplateFromFile('index');
  return template.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME)
  .addMetaTag('viewport','width=device-width,initial-scale=1')
        .setTitle("เช็คเวลาลงทะเบียนเบี้ยยังชีพผู้สูงอายุ");
}

function checkPension(birthDateString) {
  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate)) {
    return { status: "error", message: "วันเดือนปีเกิดไม่ถูกต้อง" };
  }

  const now = new Date();
  const currentYear = now.getFullYear();

  // 2 กันยายนของปีนี้ (เป็นเส้นตัดสิทธิ์)
  const cutoffDate = new Date(currentYear, 8, 2); // 2 ก.ย. เดือน 8 = ก.ย.

  // หากเกิดก่อน 2 ก.ย. ของปีนี้ → ลงทะเบียนได้ในปีงบประมาณนี้ (ต.ค.ปีนี้–ก.ย.ปีหน้า)
  if (birthDate < cutoffDate.setFullYear(currentYear - 59)) {
    const age = getAgeOnDate(birthDate, now);
    return {
      status: "eligible",
      age: age,
      allowance: getAllowance(age),
      fiscalYear: currentYear + 543 // ปีงบประมาณ พ.ศ.
    };
  } else {  // หากเกิดหลัง 2 ก.ย. ของปีนี้ลงทะเบียนได้ ตค.68
    
    const eligibleYear = birthDate.getFullYear() + 59;  //หาปีที่จะอายุ59ปี  ตอนนี้ผิดของคนที่เกิด 1 กย. 1967 แต่ถูกของคนเกิด 2 กย. 1966
    let eligibleDate = new Date(eligibleYear, 9, 1);
       if (birthDate.getMonth() < 8 || (birthDate.getMonth() === 8 && birthDate.getDate() < 2)) {
          eligibleDate = new Date(eligibleYear - 1, 9, 1); // ปีงบประมาณเริ่ม ต.ค. ปีก่อนหน้า
        } // 1 ตุลาคมของปีที่จะอายุ 59
    const fiscalYear = eligibleYear + 544; // +544 = ปีงบประมาณที่จะลงได้

    return {
      status: "not_yet",
      age: getAgeOnDate(birthDate, now),
      eligibleDate: formatThaiDate(eligibleDate),
      fiscalYear: fiscalYear
    };
  }
}

function getAgeOnDate(birthDate, refDate) {
  let age = refDate.getFullYear() - birthDate.getFullYear();
  if (
    refDate.getMonth() < birthDate.getMonth() ||
    (refDate.getMonth() === birthDate.getMonth() && refDate.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

function getAllowance(age) {
  if (age >= 90) return 1000;
  if (age >= 80) return 800;
  if (age >= 70) return 700;
  return 600;
}

function formatThaiDate(date) {
  const monthsThai = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const day = date.getDate();
  const month = monthsThai[date.getMonth()];
  const year = date.getFullYear() + 543;
  return `${day} ${month} ${year}`;
}
