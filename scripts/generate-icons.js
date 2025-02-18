const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateIcons() {
  const sourceFile = path.join(__dirname, '../public/icon-source.svg');
  const publicDir = path.join(__dirname, '../public');

  // 确保源文件存在
  try {
    await fs.access(sourceFile);
  } catch (error) {
    console.error('Source SVG file not found:', sourceFile);
    process.exit(1);
  }

  // 定义需要生成的图标尺寸
  const icons = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
  ];

  // 生成每个尺寸的图标
  for (const icon of icons) {
    try {
      await sharp(sourceFile)
        .resize(icon.size, icon.size)
        .png()
        .toFile(path.join(publicDir, icon.name));
      
      console.log(`Generated ${icon.name}`);
    } catch (error) {
      console.error(`Error generating ${icon.name}:`, error);
    }
  }

  // 生成 iPad Pro 启动图像
  try {
    await sharp(sourceFile)
      .resize(2048, 2732)
      .extend({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(publicDir, 'apple-splash-2048-2732.png'));
    
    console.log('Generated apple-splash-2048-2732.png');
  } catch (error) {
    console.error('Error generating splash screen:', error);
  }
}

generateIcons().catch(console.error); 