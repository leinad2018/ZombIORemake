define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ZIRCanvasController {
        constructor(canvas, client) {
            this.canvas = canvas;
            var customWindow = window;
            customWindow.addEventListener("resize", this.handleResize);
            customWindow.canvasController = this;
            this.resizeWindow();
            this.client = client;
            this.client.registerUpdateHandler(this);
        }
        /**
         * Updates the canvas when new information is sent from the server
         */
        onServerUpdate() {
            this.render();
        }
        render() {
            var ctx = this.canvas.getContext('2d');
            var background = this.client.getBackgroundImage();
            this.renderBackground(ctx, background);
        }
        renderBackground(ctx, imageUrl) {
            ctx.save();
            var background = new Image();
            background.src = imageUrl;
            background.onload = () => {
                var pattern = ctx.createPattern(background, 'repeat');
                ctx.fillStyle = pattern;
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                ctx.restore();
            };
        }
        resizeWindow() {
            this.canvas.width = this.canvas.parentElement.clientWidth;
            this.canvas.height = this.canvas.parentElement.clientHeight - 5;
        }
        handleResize() {
            this.canvasController.resizeWindow();
            this.canvasController.render();
        }
    }
    exports.ZIRCanvasController = ZIRCanvasController;
});
