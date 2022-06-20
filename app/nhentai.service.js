class NHentaiAPI {
    static #ENDPOINTS = {
        HOST_URL : 'https://nhentai.net',
        IMAGE_URL : 'https://i.nhentai.net',
        THUMBS_URL : 'https://t.nhentai.net',
        get API_URL() { return this.HOST_URL + '/api' },
    }

    static #ROUTES = {
        GALLERY: (id) => `${this.#ENDPOINTS.API_URL}/gallery/${id}`,
        COMMENTS: (id) => `${this.#ENDPOINTS.API_URL}/gallery/${id}/comments`,
    }

    static async corsFetch(url){
        const corsURL = 'http://localhost:8080/proxy/'

        const serverResponse = await fetch(corsURL + url, {
            method: 'GET',
            headers: new Headers({
                'Content-Type': 'application/json',
            }),
        })
    
        const originalRequestPromise = serverResponse.json()
        return originalRequestPromise   // originalRequestPromise must be awaited to read the values
    }

    static async corsFetchAsync(url){
        const corsURL = 'http://localhost:8080/proxy/'

        return fetch(corsURL + url, {
            method: 'GET',
            headers: new Headers({
                'Content-Type': 'application/json',
            }),
        })
        .then(serverResponse => serverResponse.json())
    }

    static async getDoujinById(doujinId){
        const apiResponse = await this.corsFetch(this.#ROUTES.GALLERY(doujinId))
        return new Doujin(apiResponse, this.#ENDPOINTS.THUMBS_URL)
    }

    static async getDoujinByIdAsync(doujinId){
        return this.corsFetch(this.#ROUTES.GALLERY(doujinId))
            .then(jsonResponse => new Doujin(jsonResponse, this.#ENDPOINTS.THUMBS_URL))
    }

    static async getComments(doujinId){
        return this.corsFetch(this.#ROUTES.COMMENTS(doujinId))
            .then(jsonResponse => jsonResponse.map(commentResponse => new Comment(commentResponse)))
    }
}

class Doujin{
	/**
	 * Converts an images `t` paramater to a file extension
	 * @hidden
	 * @param extension Raw type from the api
	 */
     static extensionConvert(extension) {
		switch (extension) {
			case 'p':
				return 'png';
			case 'j':
				return 'jpg';
			case 'g':
				return 'gif';
			default:
				throw new Error(`Image extension "${extension}" is not a known format.`);
		}
	}

    constructor(doujinResponse, THUMBS_URL){
        const dr = doujinResponse
        this.id = dr.id
        this.title = {
            english : dr.title.english,
            pretty : dr.title.pretty
        }
        this.images = {
            cover_url : `${THUMBS_URL}/galleries/${dr.media_id}/cover.${Doujin.extensionConvert(dr.images.cover.t)}`,
            cover : { 
                t : dr.images.cover.t,
                w : dr.images.cover.w,
                h : dr.images.cover.h
            },
            thumbnail : {
                t : dr.images.thumbnail.t,
                w : dr.images.thumbnail.w,
                h : dr.images.thumbnail.h
            }
        }
        this.tags = dr.tags // tags: {id, type, name, url, count}
    }

    /*  API RESPONSE EXAMPLE
    id: 305071
    images:
    cover: {t: 'j', w: 350, h: 497}
    pages: (9) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
    thumbnail: {t: 'j', w: 250, h: 355}
    [[Prototype]]: Object
    media_id: "1588810"
    num_favorites: 1585
    num_pages: 9
    scanlator: ""
    tags: Array(14)
    0: {id: 12227, type: 'language', name: 'english', url: '/language/english/', count: 69378}
    1: {id: 17249, type: 'language', name: 'translated', url: '/language/translated/', count: 109734}
    2: {id: 70984, type: 'parody', name: 'qualidea code', url: '/parody/qualidea-code/', count: 64}
    3: {id: 70641, type: 'character', name: 'asuha chigusa', url: '/character/asuha-chigusa/', count: 61}
    4: {id: 70642, type: 'character', name: 'kasumi chigusa', url: '/character/kasumi-chigusa/', count: 60}
    5: {id: 18015, type: 'group', name: 'fuka fuka', url: '/group/fuka-fuka/', count: 91}
    6: {id: 2051, type: 'artist', name: 'sekiya asami', url: '/artist/sekiya-asami/', count: 240}
    7: {id: 35763, type: 'tag', name: 'sole male', url: '/tag/sole-male/', count: 60070}
    8: {id: 81774, type: 'tag', name: 'kemonomimi', url: '/tag/kemonomimi/', count: 6253}
    9: {id: 19440, type: 'tag', name: 'lolicon', url: '/tag/lolicon/', count: 69490}
    10: {id: 28031, type: 'tag', name: 'sister', url: '/tag/sister/', count: 14429}
    11: {id: 35762, type: 'tag', name: 'sole female', url: '/tag/sole-female/', count: 66202}
    12: {id: 22942, type: 'tag', name: 'incest', url: '/tag/incest/', count: 28107}
    13: {id: 33172, type: 'category', name: 'doujinshi', url: '/category/doujinshi/', count: 228729}
    length: 14
    [[Prototype]]: Array(0)
    title: {english: '(C97) [Fuka Fuka (Sekiya Asami)] Uchi no Imouto Selection (Qualidea Code) [English]', japanese: '(C97) [不可不可 (関谷あさみ)] うちのいもうとセレクション (クオリディア・コード) [英訳]', pretty: 'Uchi no Imouto Selection'}
    upload_date: 1584183028
    */
}

class Comment {
    constructor(commentsResponse){
        const cr = commentsResponse
        this.id = cr.id
        this.gallery_id = cr.gallery_id
        this.poster = cr.poster
        this.body = cr.body
    }
}

