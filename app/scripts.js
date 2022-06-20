TEST_ID = 305071
codes = [305071, 373877]

async function loadItems() {
    let requests = []
    codes.forEach(doujinId => {
        requests.push(NHentaiAPI.getDoujinByIdAsync(doujinId))
    });

    Promise.all(requests).then((doujins) => {
        doujins.forEach(doujin => loadItem(doujin))
    })

    fillScreen()
    let commentCodes = await getCodesFromComments(152438)
    console.log(commentCodes)

    let uniqueCodes = [...new Set(commentCodes)]
    while (uniqueCodes.length > 0) {
        let batch = uniqueCodes.splice(0,50)
        await loadDoujinBatch(batch)
        console.log(`${uniqueCodes.length} codes remaining`)
    }
}

/**
 * Creates a thumbnail of a Doujin and inserts it into the main container
 * @param {Doujin} doujin 
 */
function loadItem(doujin) {
    let body = document.getElementById('main-container')
    body.insertAdjacentHTML('beforeend', `
    <div class="galery">
        <img src="${doujin.images.cover_url}" width="${doujin.images.thumbnail.w}" height="${doujin.images.thumbnail.h}">
        <div class="title"><a class="title" href="https://nhentai.net/g/${doujin.id}/"> ${doujin.title.english} </a></div>
    </div>
    `)
}


async function fillScreen() {
    const res = await NHentaiAPI.getDoujinById(TEST_ID)
    for (let i = 0; i < 5; i++) {
        loadItem(res)
    }
}

async function getCodesFromComments(doujinId) {
    let comments = await NHentaiAPI.getComments(doujinId)

    let codes = []
    comments.forEach(comment => codes.push(...searchValidCodes(comment.body)))

    return codes
}

function searchValidCodes(comment) {
    let codes = []
    let currentCode = ''
    let read = true
    let stringArray = [...comment]

    stringArray.forEach((char, index, array) => {
        if (!read) {
            if (isNaN(parseInt(char))) {
                read = true
            }
            return
        }

        if (isNaN(parseInt(char))) {
            if (currentCode.length >= 3 && currentCode.length <= 6) {
                codes.push(currentCode) //push valid codes once non numeric characters are found
            }
            return currentCode = ''
        }

        currentCode += char

        if (currentCode.length >= 7) {
            currentCode = ''
            read = false
            return
        }

        if (index == array.length - 1 && currentCode.length >= 3 && currentCode.length <= 6) {
            codes.push(currentCode) //push valid code once the last character is read
            return
        }
    })
    return codes;
}

function loadCodesInIntervals(codes) {
    this.codesIntervals = codes

    this.intervalID = setInterval(function () {
        let codesArr = this.codesIntervals.splice(0, 50)
        console.log("CURRENT CODES:", codesArr)
        console.log("CODES LEFT", this.codesIntervals)
        if (codesArr.length == 0) {
            clearInterval(intervalID)
            return
        }

        console.log("REQuEST SIZE: " + intervalSize)
        requests = []
        codesArr.forEach(doujinId => {
            requests.push(NHentaiAPI.getDoujinByIdAsync(doujinId))
        });

        Promise.all(requests).then((doujins) => {
            doujins.forEach(doujin => loadItem(doujin))
        })
    }, 500)
}

async function loadDoujinBatch(codes) {
    let requests = []
    codes.forEach(doujinId => {
        requests.push(NHentaiAPI.getDoujinByIdAsync(doujinId))
    });

    return Promise.allSettled(requests)
        .then((results) => {
            results.filter(results => results.status == "fulfilled")
                .forEach(results => loadItem(results.value))
        })

}

loadItems()

