self.addEventListener('push', (event) => {
    const data = event.data?.json() || {};
    const title = data.title || 'PAiMo';
    const options = {
        body: data.body,
        icon: data.icon || '/icon-192x192.png',
    };
    event.waitUntil(self.registration.showNotification(title, options));
});
