const fetch = require("node-fetch")
const fs = require("fs")
const qs = require("qs")

const stationIds = require("./stationIds.json")

const getData = async () => {
  let errors = []

  if (!fs.existsSync("data")) fs.mkdirSync("data")

  for (let year = 1961; year <= 2007; year++) {
    for (const prefectureId in stationIds) {
      for (const stationId of stationIds[prefectureId]) {
        try {
          let response = await fetch("http://www.data.jma.go.jp/gmd/risk/obsdl/show/table", {
            headers: {
              "content-type": "application/x-www-form-urlencoded",
            },
            body: qs.stringify({
              stationNumList: `["${stationId}"]`,
              aggrgPeriod: "9",
              elementNumList: '[["602",""]]',
              interAnnualFlag: "1",
              ymdList: `["${year}","${year}","1","12","1","31"]`,
              optionNumList: "[]",
              downloadFlag: "true",
              rmkFlag: "1",
              disconnectFlag: "1",
              youbiFlag: "0",
              fukenFlag: "0",
              kijiFlag: "0",
              huukouFlag: "0",
              csvFlag: "1",
              jikantaiFlag: "0",
              jikantaiList: "[1,24]",
              ymdLiteral: "1",
              PHPSESSID: "0d7ks9685240evp2hagsnerlq6",
            }),
            method: "POST",
          })

          await new Promise((resolve, reject) => {
            const fileStream = fs.createWriteStream(
              `data/data_${prefectureId}_${stationId}_${year}.csv`,
            )
            response.body.pipe(fileStream)
            response.body.on("error", reject)
            fileStream.on("finish", resolve)
          })
        } catch (error) {
          console.log(year, prefectureId, stationId, error)
          errors.push({
            year,
            prefectureId,
            stationId,
            error,
          })
        }

        console.log(year, prefectureId, stationId, "success")
      }
    }
    fs.writeFileSync("errors.json", JSON.stringify(errors))
  }
}

getData()
