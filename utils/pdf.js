import PDFJS from 'pdfjs-dist'

PDFJS.disableTextLayer = true
PDFJS.disableWorker = true

const getPageText = async (pdf, pageNo) => {
  const page = await pdf.getPage(pageNo)
  const tokenizedText = await page.getTextContent()
  const pageText = tokenizedText.items.map(token => token.str).join('')
  return pageText
}

const readFileAsync = file => {
  const promise = new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = async e => {
      try {
        resolve(fileReader.result)
      } catch (error) {
        reject(error)
      }
    }
    fileReader.readAsArrayBuffer(file)
  })
  return promise
}

export const getPDFText = async (file) => {
  const fileData = await readFileAsync(file)
  const pdf = await PDFJS.getDocument({
    data: fileData
  }).promise
    return (await Promise.all([...Array(pdf.numPages).keys()].map(i => getPageText(pdf, i+1)))).join("\n")
}
