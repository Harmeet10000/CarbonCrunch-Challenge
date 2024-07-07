import pdfjsLib from "pdfjs-dist";
import fs from "fs";

// // Extracted data storage
// let extractedData = [];

// // Function to process a single page
// function processPage(page) {
//   return page.getTextContent().then(function (textContent) {
//     // Split text by lines
//     const lines = textContent.items.map((item) => item.str);

//     // Analyze lines to identify table rows
//     const tableRows = [];
//     let currentRow = [];
//     for (const line of lines) {
//       // Check for keywords in each field (adjust as needed)
//       if (line.includes("Sl. No.")) {
//         // New table row starts
//         if (currentRow.length > 0) {
//           tableRows.push(currentRow);
//         }
//         currentRow = [];
//       } else if (
//         line.includes("Name of Project") ||
//         line.includes("State") ||
//         line.includes("District") ||
//         line.includes("No. of Project affected families (PAFs)") ||
//         line.includes("% of PAFs covered by R&R") ||
//         line.includes("Amounts paid to PAFs in the FY ")
//       ) {
//         currentRow.push(line);
//       } else if (currentRow.length > 0 && line.trim() === "") {
//         // Handle empty lines within a row (adjust as needed)
//         tableRows.push(currentRow);
//         currentRow = [];
//       }
//     }

//     // Process extracted table rows
//     if (currentRow.length > 0) {
//       tableRows.push(currentRow);
//     }

//     // Update the final extracted data array
//     extractedData = extractedData.concat(tableRows);
//   });
// }

// // Load and process the PDF document
// pdfjsLib
//   .getDocument("brsr.pdf")
//   .promise.then(function (pdfDoc) {
//     const pagePromises = [];
//     for (let i = 1; i <= pdfDoc.numPages; i++) {
//       pagePromises.push(pdfDoc.getPage(i).then(processPage));
//     }
//     return Promise.all(pagePromises);
//   })
//   .then(function () {
//     // After processing all pages, write data to JSON
//     const jsonData = JSON.stringify(extractedData, null, 2); // Pretty print JSON
//     fs.writeFile("output.json", jsonData, (err) => {
//       if (err) {
//         console.error(err);
//       } else {
//         console.log("Data written to output.json");
//       }
//     });
//   })
//   .catch(function (error) {
//     console.error("Error processing PDF:", error);
//   });


const pdfPath = "brsr.pdf";
const pageNumber = 82;
 


 
async function extractTextFromPDF(pdfPath, pageNumber) {
  const pdf = await pdfjsLib.getDocument(pdfPath).promise;
  const page = await pdf.getPage(pageNumber);
  const content = await page.getTextContent();
  return content.items.map((item) => item.str);
}


// let textArray = await extractTextFromPDF(pdfPath, pageNumber);


function processTextArray(textArray) {
  let processedArray = [];
  let currentLine = [];

  for (let item of textArray) {
    if (item.trim() === "") {
      if (currentLine.length > 0) {
        processedArray.push(currentLine);
        currentLine = [];
      }
    } else {
      currentLine.push(item);
    }
  }

  if (currentLine.length > 0) {
    processedArray.push(currentLine);
  }
  console.log(processedArray);  

  return processedArray;
}

// let processedArray = processTextArray(textArray);

function parseArray(processedArray) {
  const requiredFields = [
    "Sl.",
    "Name of the project for which",
    "State",
    "District",
    "No. of project affected",
    "% of PAFs covered",
    "Amounts paid to PAFs",
  ];

  let result = [];

  for (let i = 0; i < processedArray.length; i++) {
    let row = processedArray[i];
    let rowData = {};

    for (let j = 0; j < row.length; j++) {
      if (row[j] === "S. No.") {
        rowData["S. No."] = processedArray[i + 14]
          ? processedArray[i + 14][0]
          : "";
      } else if (row[j] === "Name of the project for which") {
        rowData["Name of the project for which"] =
          (processedArray[i + 13] ? processedArray[i + 13][0] : "") +
          " " +
          (processedArray[i + 14] ? processedArray[i + 14][0] : "");
      } else if (row[j] === "State") {
        rowData["State"] = processedArray[i + 13]
          ? processedArray[i + 13][0]
          : "";
      } else if (row[j] === "District") {
        rowData["District"] = processedArray[i + 13]
          ? processedArray[i + 13][0]
          : "";
      } else if (row[j] === "No. of project affected") {
        rowData["No. of project affected"] = processedArray[i + 13]
          ? processedArray[i + 13][0]
          : "";
      } else if (row[j] === "% of PAFs covered") {
        rowData["% of PAFs covered"] = processedArray[i + 12]
          ? processedArray[i + 12][0]
          : "";
      } else if (row[j] === "Amounts paid to PAFs") {
        rowData["Amounts paid to PAFs"] = processedArray[i + 11]
          ? processedArray[i + 11][1]
          : "";
      }
    }

    if (Object.keys(rowData).length > 0) {
      result.push(rowData);
    }
  }

  return result;
}
// let parsedData = parseArray(processedArray);



function writeToJSON(data, outputPath) {
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
}

// writeToJSON(parsedData, "output.json");


// Combining all the functions into a single function
async function processPDF(pdfPath, pageNumber, outputPath) {
  let textArray = await extractTextFromPDF(pdfPath, pageNumber);
  let processedArray = processTextArray(textArray);
  let parsedData = parseArray(processedArray);
  writeToJSON(parsedData, outputPath);
}

processPDF("brsr2.pdf", 36, "output.json");
