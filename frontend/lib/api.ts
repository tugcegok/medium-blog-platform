// ============================================================
// API CONFIG
// ============================================================

const API_URL =
  "http://127.0.0.1:8000";



// ============================================================
// LOCAL STORAGE HELPERS
// ============================================================

function getStorageItem(
  key: string
): string | null {

  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  return localStorage.getItem(
    key
  );

}



// ============================================================
// REFRESH ACCESS TOKEN
// ============================================================

async function refreshAccessToken(): Promise<string | null> {


  const refreshToken =
    getStorageItem(
      "refresh_token"
    );



  if (!refreshToken) {

    return null;

  }



  try {


    const response =
      await fetch(
        `${API_URL}/users/refresh`,
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              refresh_token:
                refreshToken,
            }),

        }
      );



    if(!response.ok){

      return null;

    }



    const data =
      await response.json();




    if(
      typeof window !== "undefined"
    ){

      if(data.access_token){

        localStorage.setItem(
          "access_token",
          data.access_token
        );

      }



      if(data.refresh_token){

        localStorage.setItem(
          "refresh_token",
          data.refresh_token
        );

      }



      if(data.token_type){

        localStorage.setItem(
          "token_type",
          data.token_type
        );

      }

    }




    return (
      data.access_token ??
      null
    );



  }catch(error){


    console.error(
      "Refresh token error:",
      error
    );


    return null;


  }


}



// ============================================================
// CLEAR AUTH
// ============================================================

export function clearAuthTokens(){


  if(
    typeof window === "undefined"
  ){

    return;

  }



  localStorage.removeItem(
    "access_token"
  );


  localStorage.removeItem(
    "refresh_token"
  );


  localStorage.removeItem(
    "token_type"
  );


}



// ============================================================
// API FETCH
// ============================================================

export async function apiFetch(

  endpoint:string,

  options:RequestInit = {}

):Promise<Response>{



  let accessToken =
    getStorageItem(
      "access_token"
    );




  const headers =
    new Headers(
      options.headers
    );




  // JSON istekleri için

  if(
    !headers.has(
      "Content-Type"
    )
    &&
    options.body
  ){

    headers.set(
      "Content-Type",
      "application/json"
    );

  }




  // TOKEN EKLE

  if(accessToken){


    headers.set(
      "Authorization",
      `Bearer ${accessToken}`
    );


  }




  let response =
    await fetch(

      `${API_URL}${endpoint}`,

      {
        ...options,
        headers,
      }

    );






  // 401 değilse direkt dön

  if(
    response.status !== 401
  ){

    return response;

  }





  // ACCESS TOKEN EXPIRED

  console.log(
    "Access token expired. Refreshing..."
  );




  accessToken =
    await refreshAccessToken();




  if(!accessToken){


    clearAuthTokens();


    return response;


  }





  // YENİ TOKEN İLE TEKRAR DENE

  headers.set(
    "Authorization",
    `Bearer ${accessToken}`
  );




  response =
    await fetch(

      `${API_URL}${endpoint}`,

      {
        ...options,
        headers,
      }

    );




  return response;


}