<template>
  <div class="allContainer">
    <div class="optinfoContainer">
      <div class="titleContinaer">
        <span>Vivarium</span>
      </div>
      <div class="setupContainer">
        <div v-for="(item, idx) in items" class="itemContainer">
          <div class="itemInfo">
            <i class="iconfont itemIcon" :class="item.icon"></i>
            <div :key="itemCntKey">{{ item.cnt }}</div>
          </div>
          <div class="itemCnt" v-if="!going">
            <i class="iconfont icon-zengjia itemChangeBtn" @click="addCnt(idx)"></i>
            <i class="iconfont icon-jianshao itemChangeBtn" @click="subCnt(idx)"></i>
          </div>
        </div>
      </div>
      <div class="optContainers" :key="optionsKey">
        <v-btn v-for="(option, index) in options" @click="option.click" size="x-large" class="optionBtn">
          {{ option.name }}
          <template v-slot:append>
            <i class="iconfont optIcon" :class="option.icon"></i>
          </template>
        </v-btn>
      </div>
      <div class="infoContainer">
        <div class="timeContainer">
          <i class="iconfont icon-jishi timeIcon"></i>
          {{ formattedTime }}
        </div>
      </div>
    </div>
    <div class="mainContainer">

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const time = ref(0);
let timerId = null;
const formattedTime = computed(() => {
  const hours = Math.floor(time.value / 3600);
  const minutes = Math.floor((time.value % 3600) / 60);
  const seconds = time.value % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

const going = ref(false)
const optionsKey = ref(0)
const intervalId = ref(null)
const cntRecordIntervalId = ref(null) // 新增的定时器ID

const startMovement = () => {
  const mainContainer = document.querySelector('.mainContainer');
  const containerWidth = mainContainer.clientWidth;
  const containerHeight = mainContainer.clientHeight;

  // 开始移动
  intervalId.value = setInterval(() => {
    if (intervalId.value === null) return;
    items.forEach(item => {
      item.entity.forEach(icon => {
        const currentLeft = parseInt(icon.style.left, 10);
        const currentTop = parseInt(icon.style.top, 10);

        // 探测最近的非自己类型的图标，范围为100px
        let nearestIcon = null;
        let minDistance = 100; // 将探测范围改为100px
        const iconType = icon.className.match(/icon-caiquanshitoujiandaobushitou|icon-caiquanshitoujiandaobujiandao|icon-caiquanshitoujiandaobubu/)[0];
        items.forEach(otherItem => {
          otherItem.entity.forEach(otherIcon => {
            if (icon !== otherIcon && iconType !== otherIcon.className.match(/icon-caiquanshitoujiandaobushitou|icon-caiquanshitoujiandaobujiandao|icon-caiquanshitoujiandaobubu/)[0]) {
              const otherLeft = parseInt(otherIcon.style.left, 10);
              const otherTop = parseInt(otherIcon.style.top, 10);
              const distance = Math.sqrt((otherLeft - currentLeft) ** 2 + (otherTop - currentTop) ** 2);
              if (distance < minDistance) {
                minDistance = distance;
                nearestIcon = otherIcon;
              }
            }
          });
        });

        let moveX = 0, moveY = 0;
        if (nearestIcon) {
          const nearestLeft = parseInt(nearestIcon.style.left, 10);
          const nearestTop = parseInt(nearestIcon.style.top, 10);
          const nearestIconType = nearestIcon.className.match(/icon-caiquanshitoujiandaobushitou|icon-caiquanshitoujiandaobujiandao|icon-caiquanshitoujiandaobubu/)[0];

          if (iconType === 'icon-caiquanshitoujiandaobujiandao' && nearestIconType === 'icon-caiquanshitoujiandaobubu') {
            moveX = nearestLeft > currentLeft ? 5 : -5;
            moveY = nearestTop > currentTop ? 5 : -5;
          } else if (iconType === 'icon-caiquanshitoujiandaobubu' && nearestIconType === 'icon-caiquanshitoujiandaobushitou') {
            moveX = nearestLeft > currentLeft ? 5 : -5;
            moveY = nearestTop > currentTop ? 5 : -5;
          } else if (iconType === 'icon-caiquanshitoujiandaobushitou' && nearestIconType === 'icon-caiquanshitoujiandaobujiandao') {
            moveX = nearestLeft > currentLeft ? 5 : -5;
            moveY = nearestTop > currentTop ? 5 : -5;
          } else {
            moveX = nearestLeft > currentLeft ? -5 : 5;
            moveY = nearestTop > currentTop ? -5 : 5;
          }
        } else {
          // 当附近没有其他图标时，朝随机方向移动
          moveX = Math.floor(Math.random() * 20) - 10;
          moveY = Math.floor(Math.random() * 20) - 10;
        }

        let newLeft = currentLeft + moveX;
        let newTop = currentTop + moveY;

        // 确保图标不会超出容器边界，仅左右打通墙壁
        if (newLeft < 0) newLeft = containerWidth + newLeft;
        if (newLeft > containerWidth) newLeft = newLeft - containerWidth;
        if (newTop < 0) newTop = 0;
        if (newTop > containerHeight - 40) newTop = containerHeight - 40; // 留出一格图标高度的空间

        icon.style.left = `${newLeft}px`;
        icon.style.top = `${newTop}px`;

        // 检测碰撞
        items.forEach(item => {
          item.entity.forEach(otherIcon => {
            if (icon !== otherIcon && isColliding(icon, otherIcon)) {
              const iconType = icon.className.match(/icon-caiquanshitoujiandaobushitou|icon-caiquanshitoujiandaobujiandao|icon-caiquanshitoujiandaobubu/)[0];
              const otherIconType = otherIcon.className.match(/icon-caiquanshitoujiandaobushitou|icon-caiquanshitoujiandaobujiandao|icon-caiquanshitoujiandaobubu/)[0];
              if (iconType === 'icon-caiquanshitoujiandaobujiandao' && otherIconType === 'icon-caiquanshitoujiandaobubu') {
                updateIconAndCnt(icon, otherIcon, item, items[1]);
              } else if (iconType === 'icon-caiquanshitoujiandaobubu' && otherIconType === 'icon-caiquanshitoujiandaobushitou') {
                updateIconAndCnt(icon, otherIcon, item, items[2]);
              } else if (iconType === 'icon-caiquanshitoujiandaobushitou' && otherIconType === 'icon-caiquanshitoujiandaobujiandao') {
                updateIconAndCnt(icon, otherIcon, item, items[0]);
              }
            }
          });
        });
      });
    });
  }, 100);

  // 每秒记录一次图标数量
  cntRecordIntervalId.value = setInterval(() => {
    items.forEach(item => {
      item.cnts.push(item.cnt);
    });
    console.log(items.map(item => item.cnts))
  }, 1000);
};

const updateIconAndCnt = (icon, otherIcon, item, targetItem) => {
  otherIcon.className = icon.className;
  item.entity = item.entity.filter(e => e !== otherIcon);
  targetItem.entity.push(otherIcon);
  item.cnt--;
  targetItem.cnt++;

  // 检查剩余的图标种类数量
  const remainingTypes = items.filter(i => i.cnt > 0);
  if (remainingTypes.length === 1) {
    window.alert('只剩下一种图标了！');
  }
}

const isColliding = (icon1, icon2) => {
  const rect1 = icon1.getBoundingClientRect();
  const rect2 = icon2.getBoundingClientRect();
  return !(rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom);
}

const stopMovement = () => {
  clearInterval(intervalId.value);
  intervalId.value = null;
  clearInterval(cntRecordIntervalId.value); // 清除记录数量的定时器
}

const startOption = {
  name: '开始',
  icon: 'icon-kaishi',
  click: () => {
    if (timerId) {
      return
    };

    if (!going.value) {
      let iconWidth = 20, iconHeight = 20;
      // 获取mainContainer元素
      const mainContainer = document.querySelector('.mainContainer');
      // 添加相应cnt数量的图表到mainContainer元素中的随机位置
      for (let i = 0; i < items.length; i++) {
        for (let j = 0; j < items[i].cnt; j++) {
          const entity = document.createElement('i');
          entity.className = `iconfont ${items[i].icon}`;
          const randomX = Math.floor(Math.random() * (mainContainer.clientWidth - iconWidth)) + iconWidth / 2;
          const randomY = Math.floor(Math.random() * (mainContainer.clientHeight - iconHeight)) + iconHeight / 2;
          entity.style.left = `${randomX}px`;
          entity.style.top = `${randomY}px`;
          entity.style.position = 'absolute';
          entity.style.fontSize = '20px';
          mainContainer.appendChild(entity);

          items[i].entity.push(entity);
        }
      }
    }

    startMovement();

    timerId = setInterval(() => {
      time.value++;
    }, 1000);

    options[0] = stopOption;
    optionsKey.value++;

    going.value = true;
  }
}

const stopOption = {
  name: '暂停',
  icon: 'icon-zanting',
  click: () => {
    if (timerId) {
      stopMovement();
      clearInterval(timerId);
      timerId = null;
    }

    options[0] = startOption;
    optionsKey.value++;
  }
}

const resetOption = {
  name: '重置',
  icon: 'icon-zhongzhi',
  click: () => {
    going.value = false;
    if (timerId) {
      stopMovement();
      clearInterval(timerId);
      timerId = null;
    }
    time.value = 0;
    options[0] = startOption;
    optionsKey.value++;

    for (let i = 0; i < items.length; i++) {
      items[i].cnt = 10;
      items[i].entity.forEach(entity => {
        entity.remove();
      })
      items[i].entity = [];
      items[i].cnts = []; // 重置cnts数组
    }
  }
}

let options = [
  startOption,
  resetOption
]

const itemCntKey = ref(0)
let items = [
  {
    "name": "石头",
    "icon": 'icon-caiquanshitoujiandaobushitou',
    "cnt": 10,
    "entity": [],
    "cnts": []
  },
  {
    "name": "剪刀",
    "icon": 'icon-caiquanshitoujiandaobujiandao',
    "cnt": 10,
    "entity": [],
    "cnts": []
  },
  {
    "name": "布",
    "icon": 'icon-caiquanshitoujiandaobubu',
    "cnt": 10,
    "entity": [],
    "cnts": []
  },
]

const addCnt = (idx) => {
  if (items[idx].cnt >= 20) return;
  items[idx].cnt++;
  itemCntKey.value++;
}

const subCnt = (idx) => {
  if (items[idx].cnt <= 5) return;
  items[idx].cnt--;
  itemCntKey.value++;
}

</script>


<style scoped>
.allContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background-color: var(--black-color);
  border: 5px solid var(--red-color);
  border-radius: 10px;
}

.optinfoContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  width: 15vw;
  border-right: 5px solid var(--red-color);
  /* background-color: white; */
}

.titleContinaer {
  font-size: 35px;
  color: var(--white-color);
  font-weight: bold;
  margin: 12px 18px;
}

.setupContainer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.itemContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 5px;
  font-size: 25px;
  color: var(--white-color);
}

.itemIcon {
  font-size: 30px;
}

.itemInfo {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.itemCnt {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  /* font-size: 25px; */
}

.itemChangeBtn {
  margin: 5px;
}

.itemChangeBtn:hover {
  cursor: pointer;
}

.itemChangeBtn:active {
  transform: scale(0.9);
}

.optContainers {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 10px 0 30px 0;
}

.optionBtn {
  margin: 10px;
  width: 10vw;
  font-size: 22px;
  background-color: var(--red-color);
  color: var(--white-color);
  border-bottom: 3px solid var(--blue-color);
}

.optIcon {
  margin-top: 5px;
  font-size: 22px;
}

.infoContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  width: 100%;
  font-size: 20px;
  border-top: 3px solid var(--red-color);
}

.timeContainer {
  font-size: 30px;
  margin: 15px;
  color: var(--white-color)
}

.timeIcon {
  font-size: 30px;
  margin-right: 10px;
}

.mainContainer {
  height: 100vh;
  width: 85vw;
  position: relative;
}

.entityIcon {
  /* width: 10px;
  height: 10px; */
  font-size: 10px;
  position: absolute;
}
</style>