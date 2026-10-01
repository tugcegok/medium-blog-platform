"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  apiFetch,
} from "../../../lib/api";



// =====================================================
// TYPE
// =====================================================

type Comment = {

  id:number;

  content:string;

  user_id:number;

  post_id:number;

};



// =====================================================
// ADMIN COMMENTS PAGE
// =====================================================

export default function AdminCommentsPage(){


  const [comments,setComments] =
    useState<Comment[]>([]);



  const [loading,setLoading] =
    useState(true);



  const [error,setError] =
    useState("");



  const [deleting,setDeleting] =
    useState<number | null>(null);





// ===================================================
// GET ALL COMMENTS
// ===================================================

const getComments = async()=>{


  try{


    setLoading(true);

    setError("");



    const response =
      await apiFetch(
        "/admin/comments",
        {
          method:"GET",
        }
      );



    const data =
      await response.json();



    if(!response.ok){


      setError(
        data.detail ||
        "Comments could not be loaded."
      );


      return;

    }



    setComments(
      data
    );


  }
  catch(error){


    console.error(
      "Admin comments error:",
      error
    );


    setError(
      "Something went wrong."
    );


  }
  finally{


    setLoading(false);


  }


};






useEffect(()=>{


  getComments();


},[]);







// ===================================================
// DELETE COMMENT
// ===================================================

const handleDeleteComment = async(
  commentId:number
)=>{


  const confirmDelete =
    window.confirm(
      "Are you sure you want to delete this comment?"
    );



  if(!confirmDelete){

    return;

  }



  try{


    setDeleting(
      commentId
    );



    const response =
      await apiFetch(
        `/admin/comments/${commentId}`,
        {
          method:"DELETE",
        }
      );



    if(!response.ok){


      const data =
        await response.json();


      setError(
        data.detail ||
        "Comment could not be deleted."
      );


      return;

    }



    setComments(
      comments.filter(
        comment =>
          comment.id !== commentId
      )
    );



  }
  catch(error){


    console.error(
      "Delete comment error:",
      error
    );


    setError(
      "Delete failed."
    );


  }
  finally{


    setDeleting(null);


  }


};
// ===================================================
// LOADING
// ===================================================

if(loading){

  return (

    <main className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-[#f5f1e8]
      text-black
    ">

      Loading comments...

    </main>

  );

}





// ===================================================
// ERROR
// ===================================================

if(error){

  return (

    <main className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-[#f5f1e8]
      text-red-600
    ">

      {error}

    </main>

  );

}







// ===================================================
// PAGE
// ===================================================

return(


  <main className="
    min-h-screen
    bg-[#f5f1e8]
    px-6
    py-20
    text-black
  ">


    <section className="
      mx-auto
      max-w-5xl
    ">



      <h1 className="
        text-5xl
        font-semibold
      ">

        Admin Comments

      </h1>



      <p className="
        mt-3
        text-black/50
      ">

        Manage all comments

      </p>





      <div className="
        mt-10
        space-y-5
      ">


        {
          comments.map(
            comment => (


              <div
                key={
                  comment.id
                }
                className="
                  rounded-2xl
                  border
                  border-black/10
                  p-6
                "
              >



                <div className="
                  space-y-3
                ">



                  <div>

                    <p className="
                      text-sm
                      text-black/40
                    ">

                      Comment ID

                    </p>


                    <p>

                      {comment.id}

                    </p>


                  </div>







                  <div>

                    <p className="
                      text-sm
                      text-black/40
                    ">

                      User ID

                    </p>


                    <p>

                      {comment.user_id}

                    </p>


                  </div>







                  <div>

                    <p className="
                      text-sm
                      text-black/40
                    ">

                      Post ID

                    </p>


                    <p>

                      {comment.post_id}

                    </p>


                  </div>







                  <div>

                    <p className="
                      text-sm
                      text-black/40
                      mb-2
                    ">

                      Content

                    </p>


                    <div className="
                      rounded-xl
                      border
                      border-black/10
                      p-4
                      whitespace-pre-wrap
                    ">

                      {comment.content}

                    </div>


                  </div>





                </div>






                <button

                  onClick={() =>
                    handleDeleteComment(
                      comment.id
                    )
                  }


                  disabled={
                    deleting === comment.id
                  }


                  className="
                    mt-6
                    rounded-full
                    bg-red-600
                    px-6
                    py-2
                    text-sm
                    text-white
                    disabled:opacity-40
                  "

                >


                  {
                    deleting === comment.id
                    ?
                    "Deleting..."
                    :
                    "Delete Comment"
                  }


                </button>




              </div>


            )
          )
        }



      </div>




    </section>



  </main>


);
}