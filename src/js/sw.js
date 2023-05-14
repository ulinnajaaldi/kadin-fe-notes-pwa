import { precacheAndRoute } from "workbox-precaching";

// Do precaching
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("push", (event) => {
  console.log("Service Worker: Pushed");
});

self.addEventListener("install", () => {
  console.log("Service Worker: Installed");

  self.skipWaiting();
});

self.addEventListener("push", (event) => {
  console.log("Service Worker: Pushed");

  const dataJson = event.data.json();
  const notification = {
    title: dataJson.title,
    options: {
      body: dataJson.options.body,
      icon: dataJson.options.icon,
      image: dataJson.options.image,
    },
  };

  event.waitUntil(
    self.registration.showNotification(notification.title, notification.options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const clickNotification = async () => {
    console.log("Notification has been clicked");
  };

  event.waitUntil(clickNotification());
});
