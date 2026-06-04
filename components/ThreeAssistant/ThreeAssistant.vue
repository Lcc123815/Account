<template>
  <view
    class="assistant"
    :style="{ left: left + 'px', top: top + 'px' }"
    @touchstart="startTouch"
    @touchmove.stop.prevent="moveTouch"
    @touchend="endDrag"
    @mousedown="startMouse"
    @click="handleTap"
  >
    <view class="halo" :class="status"></view>
    <view class="robot" :class="status">
      <view class="head">
        <view class="eye left"></view>
        <view class="eye right"></view>
        <view class="mouth"></view>
      </view>
      <view class="body"></view>
      <view class="arm a1"></view>
      <view class="arm a2"></view>
    </view>
  </view>
</template>

<script>
export default {
  props: { status: { type: String, default: 'normal' } },
  data() {
    return {
      left: 260,
      top: 430,
      startX: 0,
      startY: 0,
      originLeft: 0,
      originTop: 0,
      moved: false
    }
  },
  mounted() {
    const info = uni.getSystemInfoSync()
    this.left = Math.max(12, info.windowWidth - 112)
    this.top = Math.max(80, info.windowHeight - 220)
  },
  methods: {
    startTouch(e) {
      const touch = e.touches[0]
      this.startDrag(touch.clientX, touch.clientY)
    },
    moveTouch(e) {
      const touch = e.touches[0]
      this.moveDrag(touch.clientX, touch.clientY)
    },
    startMouse(e) {
      this.startDrag(e.clientX, e.clientY)
      const move = ev => this.moveDrag(ev.clientX, ev.clientY)
      const up = () => {
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
        this.endDrag()
      }
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    },
    startDrag(x, y) {
      this.startX = x
      this.startY = y
      this.originLeft = this.left
      this.originTop = this.top
      this.moved = false
    },
    moveDrag(x, y) {
      const info = uni.getSystemInfoSync()
      const dx = x - this.startX
      const dy = y - this.startY
      const minTop = 0
      const maxTop = info.windowHeight - 10
      const minLeft = -34
      const maxLeft = info.windowWidth - 52
      if (Math.abs(dx) + Math.abs(dy) > 6) this.moved = true
      this.left = Math.min(Math.max(minLeft, this.originLeft + dx), maxLeft)
      this.top = Math.min(Math.max(minTop, this.originTop + dy), maxTop)
    },
    endDrag() {
      setTimeout(() => { this.moved = false }, 80)
    },
    handleTap() {
      if (!this.moved) this.$emit('tap')
    }
  }
}
</script>

<style scoped>
.assistant { position: fixed; z-index: 20; width: 96px; height: 120px; }
.halo { position: absolute; left: 4px; top: 22px; width: 86px; height: 86px; border-radius: 50%; background: radial-gradient(circle, rgba(20,184,166,.28), rgba(59,130,246,.08)); filter: blur(2px); }
.halo.warning { background: radial-gradient(circle, rgba(245,158,11,.34), rgba(250,204,21,.08)); }
.halo.danger { background: radial-gradient(circle, rgba(239,68,68,.36), rgba(239,68,68,.08)); }
.robot { position: relative; width: 78px; height: 100px; margin: 8px auto 0; transform-style: preserve-3d; animation: float 2.4s ease-in-out infinite; }
.robot.happy { animation: happy 1.1s ease-in-out infinite; }
.head { position: absolute; left: 13px; top: 0; width: 52px; height: 47px; border-radius: 18px; background: linear-gradient(145deg, #e0f2fe, #67e8f9); box-shadow: inset -6px -6px 12px rgba(37,99,235,.18), 0 7px 12px rgba(14,165,233,.22); }
.eye { position: absolute; top: 17px; width: 7px; height: 9px; border-radius: 50%; background: #0f172a; }
.eye.left { left: 15px; }
.eye.right { right: 15px; }
.mouth { position: absolute; left: 20px; bottom: 11px; width: 12px; height: 5px; border-bottom: 3px solid #0f172a; border-radius: 0 0 15px 15px; }
.body { position: absolute; left: 18px; top: 48px; width: 42px; height: 48px; border-radius: 16px 16px 12px 12px; background: linear-gradient(160deg, #2563eb, #14b8a6); box-shadow: 0 8px 15px rgba(37,99,235,.22); }
.arm { position: absolute; top: 58px; width: 14px; height: 34px; border-radius: 999px; background: #7dd3fc; }
.a1 { left: 6px; transform: rotate(18deg); }
.a2 { right: 6px; transform: rotate(-18deg); }
.robot.warning .mouth, .robot.danger .mouth { border-bottom: 0; border-top: 3px solid #0f172a; border-radius: 15px 15px 0 0; }
@keyframes float { 0%,100%{ transform: translateY(0) rotateY(-8deg);} 50%{ transform: translateY(-8px) rotateY(8deg);} }
@keyframes happy { 0%,100%{ transform: translateY(0) scale(1);} 50%{ transform: translateY(-14px) scale(1.04);} }
</style>