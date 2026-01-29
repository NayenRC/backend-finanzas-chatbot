
import router from './src/routes/router.js';

console.log("Router loaded successfully");
if (router.stack) {
    console.log("Router stack length:", router.stack.length);
    // Find the dashboard route
    const dashboardLayer = router.stack.find(layer => layer.regexp && layer.regexp.toString().includes('dashboard'));
    if (dashboardLayer) {
        console.log("Dashboard route mounted successfully at /dashboard");
    } else {
        console.error("Dashboard route NOT found in stack");
    }
}
