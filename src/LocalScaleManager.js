export class LocalScaleManager {
    scaleSprite(sprite, availableSpaceWidth, availableSpaceHeight, padding, scaleMultiplier, isFullScale) {
        let scale = this.getSpriteScale(sprite.frame.width, sprite.frame.height, availableSpaceWidth, availableSpaceHeight, padding, isFullScale);
        sprite.setScale(scale * scaleMultiplier);
        return scale;
    }
    
    scaleSpriteTo (sprite, scale) {
        sprite.setScale(scale);
    }

    scaleText (sprite, availableSpaceWidth, availableSpaceHeight, padding, scaleMultiplier, isFullScale) {
        let originalWidth = sprite.width;
        let originalHeight = sprite.height;
        let scale = this.getSpriteScale(originalWidth, originalHeight, availableSpaceWidth, availableSpaceHeight, padding, isFullScale);
        sprite.setScale(scale * scaleMultiplier);
    }
    
    getSpriteScale (spriteWidth, spriteHeight, availableSpaceWidth, availableSpaceHeight, minPadding, isFullScale) {
        let ratio = 1;
        let currentDevicePixelRatio = window.devicePixelRatio;
        // Sprite needs to fit in either width or height
        let widthRatio = (spriteWidth * currentDevicePixelRatio + 2 * minPadding) / availableSpaceWidth;
        let heightRatio = (spriteHeight * currentDevicePixelRatio + 2 * minPadding) / availableSpaceHeight;
        if (widthRatio > 1 || heightRatio > 1) {
            ratio = 1 / Math.max(widthRatio, heightRatio);
        } else {
            if (isFullScale)
                ratio = 1 / Math.max(widthRatio, heightRatio);
        }
        return ratio * currentDevicePixelRatio;
    }
};
