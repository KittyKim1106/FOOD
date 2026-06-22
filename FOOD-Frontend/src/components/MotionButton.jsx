import { motion } from 'framer-motion';
import { springBouncy } from '../lib/motion';

// 通用按钮微交互组件
// 替换散落各页面的 active:scale-95 / hover:scale-[1.02]
//
// 用法：<MotionButton className="..." onClick={...}>...</MotionButton>
// props:
//   - scale hover 时缩放（默认 1.02）
//   - tap 点击缩放（默认 0.96）
//   - as: 'button' | 'div'（用于需要 motion 行为但不是按钮的场景）
export default function MotionButton({
    children,
    className = '',
    hoverScale = 1.02,
    tapScale = 0.96,
    as = 'button',
    ...props
}) {
    const MotionTag = motion[as] || motion.button;
    return (
        <MotionTag
            whileHover={{ scale: hoverScale }}
            whileTap={{ scale: tapScale }}
            transition={springBouncy}
            className={className}
            {...props}
        >
            {children}
        </MotionTag>
    );
}
