import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { QuestionData } from '../types';

export const generateExcel = async (questions: QuestionData[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Question Import');

  // --- 1. Define Columns (Map to Data) ---
  worksheet.columns = [
    { key: 'description', width: 40 }, // A: 问题描述
    { key: 'type', width: 15 },        // B: 题型
    { key: 'correctAnswer', width: 15 }, // C: 正确答案
    { key: 'score', width: 10 },       // D: 分值
    { key: 'difficulty', width: 10 },  // E: 难度
    { key: 'explanation', width: 30 }, // F: 答案说明
    { key: 'optionA', width: 25 },     // G: 选项A
    { key: 'optionB', width: 25 },     // H: 选项B
    { key: 'optionC', width: 25 },     // I: 选项C
    { key: 'optionD', width: 25 },     // J: 选项D
  ];

  // --- 2. Create Header Row 1 (Instructions) ---
  // The image has a large merged cell with detailed instructions.
  // We use RichText to approximate the red/black styling.
  
  const instructions = [
    { font: { color: { argb: 'FFFF0000' }, bold: true, size: 11, name: 'SimSun' }, text: '填写须知：\n' },
    { font: { color: { argb: 'FF000000' }, size: 11, name: 'SimSun' }, text: '1.问题描述、题型为必填，其中题型请选择“单选题、多选题、开放式问题”中的一种；\n' },
    { font: { color: { argb: 'FF000000' }, size: 11, name: 'SimSun' }, text: '2.正确答案：\n' },
    { font: { color: { argb: 'FF000000' }, size: 11, name: 'SimSun' }, text: '   1) 单选题请输入1个选项字母，多选题答案多于1个时，' },
    { font: { color: { argb: 'FFFF0000' }, bold: true, size: 11, name: 'SimSun' }, text: '多个选项字母之间无需任何符号分隔' },
    { font: { color: { argb: 'FF000000' }, size: 11, name: 'SimSun' }, text: '，大小写字母均可；\n' },
    { font: { color: { argb: 'FF000000' }, size: 11, name: 'SimSun' }, text: '   2) 开放式问题，如果有标准答案，请输入答案，答案有多个时，答案之间用“\\”（反斜杠）分隔；\n' },
    { font: { color: { argb: 'FF000000' }, size: 11, name: 'SimSun' }, text: '3.分值：请输入正整数（不超过五位）或小数（小数点后不超过两位），如果不输入或输入其他非法值，则默认设置为10分；\n' },
    { font: { color: { argb: 'FF000000' }, size: 11, name: 'SimSun' }, text: '4.难度：请选择“易、中、难”中的一种，如果不选择，则默认设置为“中”；\n' },
    { font: { color: { argb: 'FF000000' }, size: 11, name: 'SimSun' }, text: '5.选项：单选题和多选题的选项，请' },
    { font: { color: { argb: 'FFFF0000' }, bold: true, size: 11, name: 'SimSun' }, text: '至少输入2个' },
    { font: { color: { argb: 'FF000000' }, size: 11, name: 'SimSun' }, text: '，默认有4个选项，如需更多选项，请直接在“选项D”右列添加“选项E”、“选项F”等，如果不需要选项，则选项留空即可；\n' },
    { font: { color: { argb: 'FF000000' }, size: 11, name: 'SimSun' }, text: '6.添加问题时请先删除第3-6行的示例数据，' },
    { font: { color: { argb: 'FFFF0000' }, bold: true, size: 11, name: 'SimSun' }, text: '填写须知（本栏）不需要删除' },
    { font: { color: { argb: 'FF000000' }, size: 11, name: 'SimSun' }, text: '；\n' },
    { font: { color: { argb: 'FF000000' }, size: 11, name: 'SimSun' }, text: '7.每次批量导入数量' },
    { font: { color: { argb: 'FFFF0000' }, bold: true, size: 11, name: 'SimSun' }, text: '不超过300条' },
    { font: { color: { argb: 'FF000000' }, size: 11, name: 'SimSun' }, text: '，超过请分批次上传。' },
  ];

  const headerRow1 = worksheet.getRow(1);
  headerRow1.height = 160; // Approximate height based on image
  const cellA1 = headerRow1.getCell(1);
  cellA1.value = { richText: instructions };
  cellA1.alignment = { vertical: 'top', wrapText: true };
  
  // Merge A1 to J1
  worksheet.mergeCells('A1:J1');

  // --- 3. Create Header Row 2 (Column Titles) ---
  const headerValues = [
    '问题描述*', '题型*', '正确答案', '分值', '难度', '答案说明',
    '选项A', '选项B', '选项C', '选项D'
  ];
  
  const headerRow2 = worksheet.getRow(2);
  headerRow2.values = headerValues;
  headerRow2.height = 30;

  // Style Header Row 2 (Green background, White Bold Text, Borders)
  headerRow2.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF006400' } // Dark Green approximation
    };
    cell.font = {
      color: { argb: 'FFFFFFFF' }, // White
      bold: true,
      size: 11,
      name: 'SimSun'
    };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Specific red asterisk styling is hard in ExcelJS for cell values, 
  // keeping simple string '问题描述*' is usually sufficient for imports.

  // --- 4. Add Data Rows ---
  questions.forEach(q => {
    const row = worksheet.addRow({
      description: q.description,
      type: q.type,
      correctAnswer: q.correctAnswer,
      score: q.score,
      difficulty: q.difficulty,
      explanation: q.explanation,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
    });
    
    // Add borders to data cells
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.font = { name: 'SimSun', size: 11 };
      cell.alignment = { vertical: 'middle', wrapText: true };
    });
  });

  // --- 5. Export ---
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  FileSaver.saveAs(blob, `question_bank_export_${Date.now()}.xlsx`);
};