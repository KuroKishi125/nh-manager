import axios from "axios"

export function fetchAPI(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
       axios
          .get(url)
          .then(fetchResponse => {
             resolve(fetchResponse.data)
          })
          .catch(error => {
             console.log("AN ERROR OCURRED: " + new Date())
             reject(error)
          });
    })
 }