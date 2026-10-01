"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  apiFetch,
} from "../../lib/api";


// ============================================================
// TYPES
// ============================================================

type Notification = {
  id: number;
  user_id: number;
  actor_id: number | null;
  notification_type: string;
  message: string;
  post_id: number | null;
  is_read: boolean;
  created_at: string;
};


type UnreadCountResponse = {
  unread_count: number;
};


// ============================================================
// NOTIFICATIONS PAGE
// ============================================================

export default function NotificationsPage() {

  const router =
    useRouter();


  // ==========================================================
  // STATES
  // ==========================================================

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [markingId, setMarkingId] =
    useState<number | null>(null);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [markingAll, setMarkingAll] =
    useState(false);


  // ==========================================================
  // GET NOTIFICATIONS
  // ==========================================================

  const getNotifications = async () => {

    try {

      const response =
        await apiFetch(
          "/notifications",
          {
            method: "GET",
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        setError(
          data.detail ||
          "Notifications could not be loaded."
        );

        return;

      }


      setNotifications(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Notifications error:",
        error
      );

      setError(
        "Could not load notifications."
      );

    }

  };


  // ==========================================================
  // GET UNREAD COUNT
  // ==========================================================

  const getUnreadCount = async () => {

    try {

      const response =
        await apiFetch(
          "/notifications/unread-count",
          {
            method: "GET",
          }
        );


      if (!response.ok) {
        return;
      }


      const data:
        UnreadCountResponse =
        await response.json();


      setUnreadCount(
        data.unread_count
      );

    } catch (error) {

      console.error(
        "Unread count error:",
        error
      );

    }

  };


  // ==========================================================
  // LOAD PAGE
  // ==========================================================

  const loadNotifications = async () => {

    try {

      setLoading(
        true
      );

      setError(
        ""
      );

      await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);

    } finally {

      setLoading(
        false
      );

    }

  };


  useEffect(() => {

    loadNotifications();

  }, []);


  // ==========================================================
  // MARK ONE AS READ
  // ==========================================================

  const handleMarkAsRead = async (
    notificationId: number
  ) => {

    try {

      setMarkingId(
        notificationId
      );

      setMessage(
        ""
      );

      setError(
        ""
      );


      const response =
        await apiFetch(
          `/notifications/${notificationId}/read`,
          {
            method: "PUT",
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        setError(
          data.detail ||
          "Notification could not be marked as read."
        );

        return;

      }


      setNotifications(
        current =>
          current.map(
            notification =>
              notification.id === notificationId
                ? {
                    ...notification,
                    is_read: true,
                  }
                : notification
          )
      );


      setUnreadCount(
        current =>
          Math.max(
            0,
            current - 1
          )
      );


      setMessage(
        "Notification marked as read."
      );

    } catch (error) {

      console.error(
        "Mark read error:",
        error
      );

      setError(
        "Could not mark notification as read."
      );

    } finally {

      setMarkingId(
        null
      );

    }

  };


  // ==========================================================
  // MARK ALL AS READ
  // ==========================================================

  const handleMarkAllAsRead = async () => {

    try {

      setMarkingAll(
        true
      );

      setMessage(
        ""
      );

      setError(
        ""
      );


      const response =
        await apiFetch(
          "/notifications/read-all",
          {
            method: "PUT",
          }
        );


      let data:
        | {
            message?: string;
            updated_count?: number;
          }
        | null = null;


      try {

        data =
          await response.json();

      } catch {

        data = null;

      }


      if (!response.ok) {

        setError(
          data?.message ||
          "Notifications could not be marked as read."
        );

        return;

      }


      setNotifications(
        current =>
          current.map(
            notification => ({
              ...notification,
              is_read: true,
            })
          )
      );


      setUnreadCount(
        0
      );


      setMessage(
        data?.message ||
        "All notifications marked as read."
      );

    } catch (error) {

      console.error(
        "Mark all read error:",
        error
      );

      setError(
        "Could not mark all notifications as read."
      );

    } finally {

      setMarkingAll(
        false
      );

    }

  };


  // ==========================================================
  // DELETE NOTIFICATION
  // ==========================================================

  const handleDeleteNotification = async (
    notificationId: number
  ) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this notification?"
      );


    if (!confirmDelete) {
      return;
    }


    try {

      setDeletingId(
        notificationId
      );

      setMessage(
        ""
      );

      setError(
        ""
      );


      const notification =
        notifications.find(
          item =>
            item.id ===
            notificationId
        );


      const response =
        await apiFetch(
          `/notifications/${notificationId}`,
          {
            method: "DELETE",
          }
        );


      if (!response.ok) {

        let errorMessage =
          "Notification could not be deleted.";


        try {

          const data =
            await response.json();

          if (
            typeof data?.detail === "string"
          ) {

            errorMessage =
              data.detail;

          }

        } catch {
        }


        setError(
          errorMessage
        );

        return;

      }


      setNotifications(
        current =>
          current.filter(
            item =>
              item.id !==
              notificationId
          )
      );


      if (
        notification &&
        !notification.is_read
      ) {

        setUnreadCount(
          current =>
            Math.max(
              0,
              current - 1
            )
        );

      }


      setMessage(
        "Notification deleted successfully."
      );

    } catch (error) {

      console.error(
        "Delete notification error:",
        error
      );

      setError(
        "Could not delete notification."
      );

    } finally {

      setDeletingId(
        null
      );

    }

  };


  // ==========================================================
  // OPEN NOTIFICATION
  // ==========================================================

  const handleOpenNotification = async (
    notification: Notification
  ) => {

    if (
      !notification.is_read
    ) {

      await handleMarkAsRead(
        notification.id
      );

    }


    if (
      notification.post_id !== null
    ) {

      router.push(
        `/posts/${notification.post_id}`
      );

    }

  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <main className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#f5f1e8]
        text-black
      ">

        Loading notifications...

      </main>

    );

  }


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

      <section className="
        mx-auto
        max-w-5xl
      ">


        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            router.back()
          }
          className="
            text-sm
            text-black/50
            transition
            hover:text-black
          "
        >

          ← Back

        </button>


        {/* HEADER */}

        <div className="
          mt-12
          flex
          flex-col
          gap-6
          border-b
          border-black
          pb-8
          sm:flex-row
          sm:items-end
          sm:justify-between
        ">

          <div>

            <p className="
              text-xs
              uppercase
              tracking-[0.3em]
              text-black/40
            ">

              Mindscape

            </p>


            <h1 className="
              mt-5
              text-5xl
              font-semibold
              tracking-[-0.05em]
              md:text-7xl
            ">

              Notifications

            </h1>


            <p className="
              mt-5
              text-sm
              text-black/50
            ">

              {unreadCount}
              {" "}
              {
                unreadCount === 1
                  ? "unread notification"
                  : "unread notifications"
              }

            </p>

          </div>


          <button
            type="button"
            onClick={
              handleMarkAllAsRead
            }
            disabled={
              markingAll ||
              unreadCount === 0
            }
            className="
              rounded-full
              bg-black
              px-6
              py-3
              text-sm
              text-white
              transition
              hover:bg-black/80
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >

            {
              markingAll
                ? "Please wait..."
                : "Mark all as read"
            }

          </button>

        </div>


        {/* MESSAGE */}

        {
          message
          &&
          <p className="
            mt-6
            text-sm
            text-green-700
          ">

            {message}

          </p>
        }


        {/* ERROR */}

        {
          error
          &&
          <p className="
            mt-6
            text-sm
            text-red-600
          ">

            {error}

          </p>
        }


        {/* EMPTY */}

        {
          notifications.length === 0
          &&
          <div className="
            py-20
          ">

            <p className="
              text-lg
              text-black/50
            ">

              You do not have any notifications yet.

            </p>

          </div>
        }


        {/* NOTIFICATION LIST */}

        {
          notifications.length > 0
          &&
          <div className="
            border-b
            border-black/10
          ">

            {
              notifications.map(
                notification => (

                  <article
                    key={
                      notification.id
                    }
                    className={`
                      border-b
                      border-black/15
                      py-8
                      transition

                      ${
                        notification.is_read
                          ? "opacity-60"
                          : ""
                      }
                    `}
                  >

                    <div className="
                      flex
                      flex-col
                      gap-6
                      sm:flex-row
                      sm:items-start
                      sm:justify-between
                    ">

                      <button
                        type="button"
                        onClick={() =>
                          handleOpenNotification(
                            notification
                          )
                        }
                        className="
                          flex-1
                          text-left
                        "
                      >

                        <div className="
                          flex
                          flex-wrap
                          items-center
                          gap-3
                        ">

                          <span className="
                            text-xs
                            uppercase
                            tracking-[0.18em]
                            text-black/40
                          ">

                            {
                              notification.notification_type
                            }

                          </span>


                          {
                            !notification.is_read
                            &&
                            <span className="
                              rounded-full
                              bg-black
                              px-3
                              py-1
                              text-[10px]
                              uppercase
                              tracking-[0.15em]
                              text-white
                            ">

                              New

                            </span>
                          }

                        </div>


                        <p className="
                          mt-4
                          text-lg
                          leading-relaxed
                          text-black/75
                        ">

                          {notification.message}

                        </p>


                        <div className="
                          mt-4
                          flex
                          flex-wrap
                          gap-4
                          text-xs
                          text-black/40
                        ">

                          <span>

                            {
                              new Date(
                                notification.created_at
                              ).toLocaleString()
                            }

                          </span>


                          {
                            notification.actor_id !== null
                            &&
                            <span>

                              Actor #{notification.actor_id}

                            </span>
                          }


                          {
                            notification.post_id !== null
                            &&
                            <span>

                              Story #{notification.post_id}

                            </span>
                          }

                        </div>

                      </button>


                      <div className="
                        flex
                        flex-wrap
                        gap-3
                      ">

                        {
                          !notification.is_read
                          &&
                          <button
                            type="button"
                            onClick={() =>
                              handleMarkAsRead(
                                notification.id
                              )
                            }
                            disabled={
                              markingId ===
                              notification.id
                            }
                            className="
                              rounded-full
                              border
                              border-black/30
                              px-4
                              py-2
                              text-xs
                              transition
                              hover:bg-black
                              hover:text-white
                              disabled:opacity-40
                            "
                          >

                            {
                              markingId ===
                              notification.id
                                ? "Saving..."
                                : "Mark as read"
                            }

                          </button>
                        }


                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteNotification(
                              notification.id
                            )
                          }
                          disabled={
                            deletingId ===
                            notification.id
                          }
                          className="
                            rounded-full
                            border
                            border-red-600/40
                            px-4
                            py-2
                            text-xs
                            text-red-700
                            transition
                            hover:bg-red-600
                            hover:text-white
                            disabled:opacity-40
                          "
                        >

                          {
                            deletingId ===
                            notification.id
                              ? "Deleting..."
                              : "Delete"
                          }

                        </button>

                      </div>

                    </div>

                  </article>

                )
              )
            }

          </div>
        }

      </section>

    </main>

  );

}