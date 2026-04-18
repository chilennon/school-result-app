// ── GRADE ──
function grade(score) {
  if (score === null || isNaN(score)) return { g: "—", remark: "—" };
  if (score >= 70) return { g: "A", remark: "Excellent" };
  if (score >= 60) return { g: "B", remark: "Very Good" };
  if (score >= 50) return { g: "C", remark: "Credit" };
  if (score >= 40) return { g: "D", remark: "Pass" };
  return { g: "F", remark: "Fail" };
}

// ── ROWS ──
let rc = 0;
window.onload = () => {
  addBulkRows(8);
};

function addRow(sub = "", ca = "", exam = "", sa = "") {
  rc++;
  const id = rc;
  const tb = document.getElementById("subjectsBody");
  const tr = document.createElement("tr");
  tr.id = "r" + id;
  tr.innerHTML = `
    <td style="color:#bbb;font-size:.75rem">${id}</td>
    <td><input type="text" placeholder="Subject" value="${sub}" oninput="calcRow(${id})"/></td>
    <td><input type="number" id="ca${id}" min="0" max="40" placeholder="0–40" value="${ca}" oninput="calcRow(${id})"/></td>
    <td><input type="number" id="ex${id}" min="0" max="60" placeholder="0–60" value="${exam}" oninput="calcRow(${id})"/></td>
    <td id="tt${id}"><span class="cc">—</span></td>
    <td><input type="number" id="sa${id}" min="0" max="100" step="0.1" placeholder="optional" value="${sa}" oninput="calcRow(${id})"/></td>
    <td id="gr${id}"><span class="gb g_">—</span></td>
    <td id="rm${id}" style="font-size:.79rem;color:#999">—</td>
    <td><button class="btn btn-del" onclick="removeRow('r${id}')">✕</button></td>
  `;
  tb.appendChild(tr);
  calcRow(id);
}

function addBulkRows(n) {
  for (let i = 0; i < n; i++) addRow();
}
function removeRow(id) {
  document.getElementById(id)?.remove();
  recalc();
}

function calcRow(id) {
  const caEl = document.getElementById("ca" + id);
  const exEl = document.getElementById("ex" + id);
  if (!caEl) return;
  const ca = caEl.value !== "" ? parseFloat(caEl.value) : null;
  const ex = exEl.value !== "" ? parseFloat(exEl.value) : null;
  let tt = null;
  if (ca !== null && ex !== null) tt = Math.min(ca, 40) + Math.min(ex, 60);
  else if (ca !== null) tt = Math.min(ca, 40);
  else if (ex !== null) tt = Math.min(ex, 60);
  const ttEl = document.getElementById("tt" + id);
  const grEl = document.getElementById("gr" + id);
  const rmEl = document.getElementById("rm" + id);
  if (tt !== null) {
    ttEl.innerHTML = `<span class="cc">${tt}</span>`;
    const { g, remark } = grade(tt);
    grEl.innerHTML = `<span class="gb g${g}">${g}</span>`;
    rmEl.textContent = remark;
    rmEl.style.color =
      g === "A"
        ? "#2a7a4b"
        : g === "B"
          ? "#1a4fa0"
          : g === "F"
            ? "#c0392b"
            : "#777";
  } else {
    ttEl.innerHTML = '<span class="cc">—</span>';
    grEl.innerHTML = '<span class="gb g_">—</span>';
    rmEl.textContent = "—";
    rmEl.style.color = "#aaa";
  }
  recalc();
}

function recalc() {
  const rows = document.querySelectorAll("#subjectsBody tr");
  let tts = [],
    sas = [];
  rows.forEach((tr) => {
    const ca = document.getElementById("ca" + tr.id.slice(1));
    const ex = document.getElementById("ex" + tr.id.slice(1));
    const sa = document.getElementById("sa" + tr.id.slice(1));
    if (!ca) return;
    const cv = ca.value !== "" ? parseFloat(ca.value) : null;
    const ev = ex.value !== "" ? parseFloat(ex.value) : null;
    const sv = sa && sa.value !== "" ? parseFloat(sa.value) : null;
    if (cv !== null || ev !== null) tts.push((cv || 0) + (ev || 0));
    if (sv !== null) sas.push(sv);
  });
  const n = tts.length;
  document.getElementById("sumN").textContent = n;
  if (!n) {
    ["sumTA", "sumFA", "sumH", "sumL", "sumG"].forEach(
      (i) => (document.getElementById(i).textContent = "—"),
    );
    return;
  }
  const ta = tts.reduce((a, b) => a + b, 0) / n;
  const fa = sas.length ? sas.reduce((a, b) => a + b, 0) / sas.length : ta;
  const { g } = grade(fa);
  document.getElementById("sumTA").textContent = ta.toFixed(1) + "%";
  document.getElementById("sumFA").textContent = fa.toFixed(1) + "%";
  document.getElementById("sumH").textContent = Math.max(...tts);
  document.getElementById("sumL").textContent = Math.min(...tts);
  document.getElementById("sumG").textContent = g;
}

function calcAbsent() {
  const o = parseFloat(document.getElementById("daysOpened").value) || 0;
  const p = parseFloat(document.getElementById("daysPresent").value) || 0;
  document.getElementById("daysAbsent").value = Math.max(0, o - p);
}

function gv(id) {
  return document.getElementById(id)?.value || "";
}

function collectSubjects() {
  const rows = document.querySelectorAll("#subjectsBody tr");
  const data = [];
  rows.forEach((tr) => {
    const subj = tr.querySelector("input[type=text]");
    const id = tr.id.slice(1);
    const ca = document.getElementById("ca" + id);
    const ex = document.getElementById("ex" + id);
    const sa = document.getElementById("sa" + id);
    if (!subj || !ca) return;
    const sv = subj.value.trim();
    const cv = ca.value !== "" ? parseFloat(ca.value) : null;
    const ev = ex.value !== "" ? parseFloat(ex.value) : null;
    const sav = sa && sa.value !== "" ? parseFloat(sa.value) : null;
    if (!sv && cv === null && ev === null) return;
    const tt = cv !== null || ev !== null ? (cv || 0) + (ev || 0) : null;
    const { g, remark } = tt !== null ? grade(tt) : { g: "—", remark: "—" };
    data.push({
      subject: sv || "(Unnamed)",
      ca: cv !== null ? cv : "—",
      exam: ev !== null ? ev : "—",
      tt: tt !== null ? tt : "—",
      sessAvg: sav !== null ? sav : "—",
      g,
      remark,
    });
  });
  return data;
}

function clearAll() {
  if (!confirm("Clear all data and start fresh?")) return;
  document.querySelectorAll("input,textarea").forEach((e) => (e.value = ""));
  document.querySelectorAll("select").forEach((e) => (e.value = ""));
  document.getElementById("subjectsBody").innerHTML = "";
  rc = 0;
  addBulkRows(8);
  showToast("Cleared.", "success");
}

// ── PDF EXPORT ──
function exportPDF() {
  const school = gv("schoolName");
  const address = gv("schoolAddress");
  const email = gv("schoolEmail");
  const phone = gv("schoolPhone");
  const student = gv("studentName");
  const studentId = gv("studentId");
  const sex = gv("sex");
  const age = gv("age");
  const cls = gv("className");
  const session = gv("session");
  const term = gv("term");
  const classAvg = gv("classAvg");
  const dO = gv("daysOpened");
  const dP = gv("daysPresent");
  const dA = gv("daysAbsent");
  const teacherName = gv("teacherName");
  const headName = gv("headTeacherName");
  const tRemark = gv("teacherRemark");
  const hRemark = gv("headRemark");
  const nextTerm = gv("nextTerm");
  const promotion = gv("promotion");

  if (!student) {
    showToast("Please enter the student name.", "error");
    return;
  }
  const subjects = collectSubjects();
  if (!subjects.length) {
    showToast("Please add at least one subject with scores.", "error");
    return;
  }

  const tts = subjects.filter((s) => typeof s.tt === "number").map((s) => s.tt);
  const sas = subjects
    .filter((s) => typeof s.sessAvg === "number")
    .map((s) => s.sessAvg);
  const termAvg = tts.length ? tts.reduce((a, b) => a + b, 0) / tts.length : 0;
  const finalAvg = sas.length
    ? sas.reduce((a, b) => a + b, 0) / sas.length
    : termAvg;
  const { g: finalGrade } = grade(finalAvg);

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210,
    PL = 12,
    PR = 12,
    CW = W - PL - PR;

  // top rule
  doc.setFillColor(26, 79, 160);
  doc.rect(0, 0, W, 2, "F");

  // school name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(15, 17, 23);
  doc.text(school || "School Name", W / 2, 15, { align: "center" });

  // address
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 70, 60);
  const contactParts = [address, email ? ":" + email : null, phone].filter(
    Boolean,
  );
  doc.text(contactParts.join("   "), W / 2, 22, { align: "center" });

  // title banner
  doc.setFillColor(26, 79, 160);
  doc.rect(PL, 27, CW, 8.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  const banner = [session || "", (term || "TERM REPORT").toUpperCase()]
    .filter(Boolean)
    .join(" – ");
  doc.text(banner, W / 2, 33, { align: "center" });

  // student info grid
  let y = 40;
  doc.setFillColor(248, 246, 240);
  doc.rect(PL, y, CW, 30, "F");
  doc.setDrawColor(212, 207, 195);
  doc.setLineWidth(0.3);
  doc.rect(PL, y, CW, 30, "S");

  const L = [
    ["NAME OF PUPIL:", student],
    ["SEX:", sex || "—"],
    ["AGE:", age || "—"],
    ["STUDENT ID:", studentId || "—"],
    ["CLASS:", cls || "—"],
  ];
  const R = [
    ["TERM AVG SCORE:", termAvg.toFixed(1) + " %"],
    ["FINAL GRADE:", finalGrade],
    ["FINAL AVG SCORE:", finalAvg.toFixed(1) + " %"],
    ["NO. OF SUBJECT:", subjects.length],
    ["CLASS AVG SCORE:", classAvg ? classAvg + "%" : "—"],
  ];
  L.forEach((r, i) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.8);
    doc.setTextColor(80, 70, 60);
    doc.text(r[0], PL + 3, y + 6.5 + i * 5.2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 17, 23);
    doc.text(String(r[1]), PL + 36, y + 6.5 + i * 5.2);
  });
  R.forEach((r, i) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.8);
    doc.setTextColor(80, 70, 60);
    doc.text(r[0], PL + CW / 2 + 2, y + 6.5 + i * 5.2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 17, 23);
    doc.text(String(r[1]), PL + CW / 2 + 38, y + 6.5 + i * 5.2);
  });

  // COGNITIVE DOMAIN header
  y += 34;
  doc.setFillColor(26, 79, 160);
  doc.rect(PL, y, CW, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("COGNITIVE DOMAIN", W / 2, y + 4.8, { align: "center" });
  y += 7;

  doc.autoTable({
    startY: y,
    head: [
      [
        "SUBJECT",
        "CA",
        "EXAM",
        "TERM TOTAL",
        "SESSION\nAVERAGE",
        "GRADE",
        "REMARKS",
      ],
    ],
    body: subjects.map((s) => [
      s.subject,
      s.ca,
      s.exam,
      s.tt,
      s.sessAvg,
      s.g,
      s.remark,
    ]),
    margin: { left: PL, right: PR },
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 3.5,
      textColor: [15, 17, 23],
    },
    headStyles: {
      fillColor: [240, 237, 229],
      textColor: [15, 17, 23],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 38, halign: "left" },
      1: { cellWidth: 14, halign: "center" },
      2: { cellWidth: 14, halign: "center" },
      3: { cellWidth: 18, halign: "center" },
      4: { cellWidth: 22, halign: "center" },
      5: { cellWidth: 14, halign: "center" },
      6: { halign: "center" },
    },
    alternateRowStyles: { fillColor: [249, 247, 242] },
    didParseCell: function (d) {
      if (d.section === "body" && d.column.index === 5) {
        const g = d.cell.raw;
        if (g === "A") {
          d.cell.styles.textColor = [42, 122, 75];
          d.cell.styles.fontStyle = "bold";
        } else if (g === "B") {
          d.cell.styles.textColor = [26, 79, 160];
          d.cell.styles.fontStyle = "bold";
        } else if (g === "C") {
          d.cell.styles.textColor = [154, 98, 0];
        } else if (g === "D") {
          d.cell.styles.textColor = [192, 57, 43];
        } else if (g === "F") {
          d.cell.styles.textColor = [139, 26, 26];
          d.cell.styles.fontStyle = "bold";
        }
      }
      if (d.section === "body" && d.column.index === 6) {
        const r = d.cell.raw;
        if (r === "Excellent") {
          d.cell.styles.textColor = [42, 122, 75];
        } else if (r === "Very Good" || r === "Credit") {
          d.cell.styles.textColor = [26, 79, 160];
        } else if (r === "Fail") {
          d.cell.styles.textColor = [192, 57, 43];
        }
      }
    },
  });

  y = doc.lastAutoTable.finalY;

  // ATTENDANCE ROW
  const third = CW / 3;
  doc.setFillColor(26, 79, 160);
  doc.rect(PL, y, third, 7, "F");
  doc.setFillColor(42, 122, 75);
  doc.rect(PL + third, y, third, 7, "F");
  doc.setFillColor(192, 57, 43);
  doc.rect(PL + 2 * third, y, third, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(
    "NO OF DAYS SCHOOL OPENED: " + (dO || "—"),
    PL + third / 2,
    y + 4.8,
    { align: "center" },
  );
  doc.text(
    "NO OF DAYS PRESENT: " + (dP || "—"),
    PL + third + third / 2,
    y + 4.8,
    { align: "center" },
  );
  doc.text(
    "NO OF DAYS ABSENT: " + (dA || "—"),
    PL + 2 * third + third / 2,
    y + 4.8,
    { align: "center" },
  );
  y += 10;

  if (y > 185) {
    doc.addPage();
    y = 14;
  }

  // AFFECTIVE + PSYCHOMOTOR + KEYS
  const affRows = [
    ["Punctuality", gv("a0")],
    ["Perseverance", gv("a1")],
    ["Neatness", gv("a2")],
    ["Honesty", gv("a3")],
    ["Attentiveness", gv("a4")],
    ["Politeness", gv("a5")],
    ["Leadership", gv("a6")],
    ["Relationship with students", gv("a7")],
    ["Emotional stability", gv("a8")],
    ["Health", gv("a9")],
  ];
  const psyRows = [
    ["Handing of tools", gv("p0")],
    ["Sports and games", gv("p1")],
    ["Musical skills", gv("p2")],
    ["Drawing painting", gv("p3")],
    ["Verbal fluency", gv("p4")],
    ["Writing", gv("p5")],
  ];

  const aW = CW * 0.34,
    pW = CW * 0.27,
    kW = CW - aW - pW - 4;
  const rH = 6.0;

  // section headers
  doc.setFillColor(26, 79, 160);
  doc.rect(PL, y, aW, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("AFFECTIVE DOMAIN", PL + aW / 2, y + 4.8, { align: "center" });
  doc.setFillColor(26, 79, 160);
  doc.rect(PL + aW + 2, y, pW, 7, "F");
  doc.text("PSYCHOMOTOR SKILLS", PL + aW + 2 + pW / 2, y + 4.8, {
    align: "center",
  });
  doc.setFillColor(26, 79, 160);
  doc.rect(PL + aW + pW + 4, y, kW, 7, "F");
  doc.text("KEY TO SUBJECT GRADING", PL + aW + pW + 4 + kW / 2, y + 4.8, {
    align: "center",
  });
  y += 7;

  // affective rows
  affRows.forEach((row, i) => {
    const ry = y + i * rH;
    if (i % 2 === 0) {
      doc.setFillColor(249, 247, 242);
      doc.rect(PL, ry, aW, rH, "F");
    }
    doc.setDrawColor(220, 215, 205);
    doc.setLineWidth(0.2);
    doc.rect(PL, ry, aW, rH, "S");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(15, 17, 23);
    doc.text(row[0], PL + 2, ry + 4.1);
    if (row[1]) {
      doc.setFont("helvetica", "bold");
      doc.text(row[1], PL + aW - 3, ry + 4.1, { align: "right" });
    }
  });

  // psychomotor rows
  psyRows.forEach((row, i) => {
    const ry = y + i * rH;
    if (i % 2 === 0) {
      doc.setFillColor(249, 247, 242);
      doc.rect(PL + aW + 2, ry, pW, rH, "F");
    }
    doc.setDrawColor(220, 215, 205);
    doc.setLineWidth(0.2);
    doc.rect(PL + aW + 2, ry, pW, rH, "S");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(15, 17, 23);
    doc.text(row[0], PL + aW + 4, ry + 4.1);
    if (row[1]) {
      doc.setFont("helvetica", "bold");
      doc.text(row[1], PL + aW + 2 + pW - 3, ry + 4.1, { align: "right" });
    }
  });

  // grading key rows
  const kX = PL + aW + pW + 4;
  const kRows = [
    ["70-100", "Excellent", "A"],
    ["60-69", "Good", "B"],
    ["50-59", "Credit", "C"],
    ["40-49", "Pass", "D"],
    ["30-39", "Fail", "F"],
  ];
  kRows.forEach((row, i) => {
    const ry = y + i * rH;
    if (i % 2 === 0) {
      doc.setFillColor(249, 247, 242);
      doc.rect(kX, ry, kW, rH, "F");
    }
    doc.setDrawColor(220, 215, 205);
    doc.setLineWidth(0.2);
    doc.rect(kX, ry, kW, rH, "S");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(15, 17, 23);
    doc.text(row[0], kX + 2, ry + 4.1);
    doc.text(row[1], kX + 14, ry + 4.1);
    const gc =
      row[2] === "A"
        ? [42, 122, 75]
        : row[2] === "B"
          ? [26, 79, 160]
          : row[2] === "C"
            ? [154, 98, 0]
            : row[2] === "D"
              ? [180, 80, 30]
              : [192, 57, 43];
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...gc);
    doc.text(row[2], kX + kW - 3, ry + 4.1, { align: "right" });
    doc.setTextColor(15, 17, 23);
  });

  // KEY TO AFFECTIVE DOMAIN & PSYCHOMOTOR box
  const psyBottom = y + psyRows.length * rH;
  const kAffW = pW + kW + 2;
  doc.setFillColor(240, 237, 229);
  doc.setDrawColor(220, 215, 205);
  doc.setLineWidth(0.2);
  doc.rect(PL + aW + 2, psyBottom, kAffW, 6, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(15, 17, 23);
  doc.text(
    "KEY TO AFFECTIVE DOMAIN & PSYCHOMOTOR",
    PL + aW + 2 + kAffW / 2,
    psyBottom + 4,
    { align: "center" },
  );

  const keyScale = [
    "5- Excellent",
    "4- Very good",
    "3- Good",
    "2- Average",
    "1- Below average",
  ];
  let ky = psyBottom + 6;
  const half = Math.ceil(keyScale.length / 2);
  keyScale.forEach((txt, i) => {
    const col = i < half ? PL + aW + 4 : PL + aW + 2 + kAffW / 2 + 2;
    const row = i < half ? i : i - half;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 17, 23);
    doc.text(txt, col, ky + row * 5.2);
  });

  y = Math.max(y + affRows.length * rH, ky + half * 5.2) + 8;

  if (y > 252) {
    doc.addPage();
    y = 14;
  }

  // CLASS TEACHER'S REMARK
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 17, 23);
  doc.text("CLASS TEACHER'S REMARK:", PL, y);
  y += 7;
  if (tRemark) {
    const lines = doc.splitTextToSize(tRemark, CW);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(lines, PL, y);
    y += lines.length * 5.3 + 7;
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(160, 150, 140);
    doc.text("No remark entered.", PL + 2, y);
    y += 9;
  }

  if (y > 258) {
    doc.addPage();
    y = 14;
  }

  // HEAD TEACHER'S COMMENT
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 17, 23);
  doc.text("HEAD TEACHER'S COMMENT:", PL, y);
  y += 7;
  if (hRemark) {
    const lines = doc.splitTextToSize(hRemark, CW);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 17, 23);
    doc.text(lines, PL, y);
    y += lines.length * 5.3 + 7;
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(160, 150, 140);
    doc.text("No comment entered.", PL + 2, y);
    y += 9;
  }

  if (promotion) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(26, 79, 160);
    doc.text("PROMOTION STATUS: " + promotion, PL, y);
    y += 8;
  }

  if (nextTerm) {
    if (y > 270) {
      doc.addPage();
      y = 14;
    }
    doc.setFillColor(26, 79, 160);
    doc.rect(PL, y, CW, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text("NEXT TERM BEGINS: " + nextTerm, W / 2, y + 5.5, {
      align: "center",
    });
    y += 11;
  }

  // signature lines
  if (y < 260) {
    y = 260;
  }
  doc.setDrawColor(180, 175, 165);
  doc.setLineWidth(0.5);
  doc.line(PL, y, PL + 55, y);
  doc.line(W - PR - 55, y, W - PR, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(130, 120, 110);
  doc.text(
    teacherName
      ? teacherName + " (Class Teacher)"
      : "Class Teacher's Signature",
    PL,
    y + 5,
  );
  doc.text(
    headName ? headName + " (Head Teacher)" : "Head Teacher's Signature",
    W - PR - 55,
    y + 5,
  );

  // footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(190, 185, 175);
  doc.text(
    "Generated by SchoolResult · " +
      new Date().toLocaleDateString("en-NG", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    W / 2,
    292,
    { align: "center" },
  );

  const fname = `${(student || "Student").replace(/\s+/g, "_")}_${(term || "Report").replace(/\s+/g, "_")}${session ? "_" + session : ""}.pdf`;
  doc.save(fname);
  showToast("✅ PDF exported successfully!", "success");
}

function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove("show"), 3500);
}
