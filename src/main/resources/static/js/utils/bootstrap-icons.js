/**
 * Bootstrap Icons 工具类
 * @class
 */
class BootstrapIcons {
    constructor() {
        this.iconCache = new Map();
        this.baseUrl = '/lib/bootstrap-icons/';
    }

    /**
     * 加载SVG图标
     * @param {string} iconName - 图标名称
     * @returns {Promise<string>} SVG内容
     */
    async loadIcon(iconName) {
        if (this.iconCache.has(iconName)) {
            return this.iconCache.get(iconName);
        }

        try {
            const response = await fetch(`${this.baseUrl}${iconName}.svg`);
            const svgContent = await response.text();
            this.iconCache.set(iconName, svgContent);
            return svgContent;
        } catch (error) {
            console.error(`加载图标失败: ${iconName}`, error);
            return '';
        }
    }

    /**
     * 渲染图标到指定元素
     * @param {HTMLElement} element - 目标元素
     * @param {string} iconName - 图标名称
     */
    async renderIcon(element, iconName) {
        const svgContent = await this.loadIcon(iconName);
        if (svgContent) {
            element.innerHTML = svgContent;
        }
    }
}

// 创建单例实例
const iconLoader = new BootstrapIcons();
export default iconLoader;