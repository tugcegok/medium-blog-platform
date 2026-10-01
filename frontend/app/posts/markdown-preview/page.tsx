"use client";

import {
  useState,
} from "react";

import {
  apiFetch,
} from "../../../lib/api";


// ============================================================
// TYPE
// ============================================================

type PreviewResponse = {
  markdown: string;
  html: string;
};


// ============================================================
// MARKDOWN PREVIEW PAGE
// ============================================================

export default function MarkdownPreviewPage() {


  const [markdown, setMarkdown] =
    useState("");



  const [html, setHtml] =
    useState("");



  const [loading, setLoading] =
    useState(false);



  const [error, setError] =
    useState("");





  // ==========================================================
  // PREVIEW REQUEST
  // ==========================================================

  const handlePreview =
    async () => {


    try {


      setLoading(true);

      setError("");



      const response =
        await apiFetch(
          "/posts/markdown/preview",
          {

            method:"POST",

            headers:{
              "Content-Type":
                "application/json",
            },


            body:
              JSON.stringify({

                content: markdown,

              })

          }
        );



      const data:any =
        await response.json();




      // ==============================
      // ERROR HANDLING
      // ==============================

      if(!response.ok){


        const errorMessage =
          Array.isArray(data.detail)

          ?

          data.detail
            .map(
              (err:any) =>
                err.msg
            )
            .join(", ")

          :

          data.detail ||
          "Preview failed.";



        setError(
          errorMessage
        );


        return;


      }





      // ==============================
      // SUCCESS
      // ==============================

      const result:PreviewResponse =
        data;



      setHtml(
        result.html
      );



    }catch(error){


      console.error(
        error
      );


      setError(
        "Server connection failed."
      );


    }finally{


      setLoading(false);


    }


  };





  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <main className="
      min-h-screen
      bg-[#f5f1e8]
      px-6
      py-20
      text-black
    ">


      <div className="
        mx-auto
        max-w-7xl
      ">


        <h1 className="
          text-6xl
          font-semibold
          tracking-tight
        ">

          Markdown Preview

        </h1>





        <div className="
          mt-12
          grid
          gap-8
          lg:grid-cols-2
        ">



          {/* MARKDOWN EDITOR */}

          <section>


            <h2 className="
              mb-4
              text-sm
              uppercase
              tracking-[0.3em]
              text-black/40
            ">

              Markdown Editor

            </h2>





            <textarea

              value={markdown}

              onChange={
                e =>
                  setMarkdown(
                    e.target.value
                  )
              }



              placeholder="
# FastAPI Nedir?

**FastAPI** modern bir Python frameworküdür.
              "



              rows={25}



              className="
                w-full
                rounded-xl
                border
                border-black/20
                bg-transparent
                p-6
                text-lg
                outline-none
              "

            />





            <button

              onClick={handlePreview}

              disabled={loading}



              className="
                mt-6
                rounded-full
                bg-black
                px-8
                py-3
                text-[#f5f1e8]
              "

            >


              {
                loading
                  ? "Rendering..."
                  : "Preview"
              }


            </button>





            {
              error && (

                <p className="
                  mt-4
                  text-red-600
                ">

                  {error}

                </p>

              )
            }



          </section>





          {/* HTML PREVIEW */}

          <section>


            <h2 className="
              mb-4
              text-sm
              uppercase
              tracking-[0.3em]
              text-black/40
            ">

              Preview

            </h2>





            <div

              className="
                min-h-[600px]
                rounded-xl
                border
                border-black/20
                bg-white
                p-8
              "



              dangerouslySetInnerHTML={{

                __html: html,

              }}



            />



          </section>




        </div>



      </div>


    </main>

  );

}