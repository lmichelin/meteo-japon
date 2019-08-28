const fetch = require("node-fetch")
const { JSDOM } = require("jsdom")
const fs = require("fs")

const getStationIds = async () => {
  let prefecturesHTML = await fetch("http://www.data.jma.go.jp/gmd/risk/obsdl/top/station", {
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: "pd=00",
    method: "POST",
  }).then(response => response.text())

  let prefectures = {}

  const prefecturesDocument = new JSDOM(prefecturesHTML).window.document
  for (const element of prefecturesDocument.querySelectorAll('input[name="prid"]')) {
    prefectures[element.value] = element.parentNode.textContent
  }

  fs.writeFileSync("prefectureIds.json", JSON.stringify(prefectures))

  let stIdsMapping = {}
  let stationIds = {}

  for (const prId of Object.keys(prefectures)) {
    stIdsMapping[prId] = {}
    let stationsHTML = await fetch("http://www.data.jma.go.jp/gmd/risk/obsdl/top/station", {
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: "pd=" + prId,
      method: "POST",
    }).then(response => response.text())

    const stationsDocument = new JSDOM(stationsHTML).window.document
    for (const element of stationsDocument.querySelectorAll('input[name="stid"]')) {
      if (element.value.startsWith("h")) continue
      stIdsMapping[prId][element.value] = true
    }
    let tmpStIds = Object.keys(stIdsMapping[prId])
    tmpStIds.sort()

    stationIds[prId] = tmpStIds

    console.log(Object.keys(stationIds).length)
  }

  fs.writeFileSync("stationIds.json", JSON.stringify(stationIds))
}

getStationIds()
