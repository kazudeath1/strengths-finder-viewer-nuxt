<template>
  <div
    id="app"
    @dragover.prevent="onFileDragOver"
    @drop.prevent="parsePdf"
    @dragleave.prevent="onFileDragLeave"
  >
    <div class="no-content" v-if="members.length === 0">PDFファイルをここにドロップ😋</div>
    <template v-else>
      <draggable v-model="members" class="members-list" tag="div" @change="memberChanged">
        <div class="member-container" :key="member.name" v-for="member in members">
          <div class="member-header">
            <span class="name">{{ member.name }}</span>
            <button class="button" @click="remove(member)">消</button>
          </div>
          <div
            :key="str"
            v-for="(str, strIndex) in member.strs"
            class="str"
            :class="{ top5: strIndex < 5, top10: strIndex >= 5 && strIndex < 10, highlight: highlightStr === str}"
            @mouseenter="() => onEnter(str)"
            :style="{ 'border-color': color(str) }"
          >{{strIndex + 1}}. {{ str }}</div>
        </div>
      </draggable>
      <div class="selected-strength-container">
        <div v-if="selectedStrength" class="selected-strength">
          <div class="name">{{selectedStrength.name}}</div>
          <div class="description">{{selectedStrength.description}}</div>
        </div>
        <div v-else class="selected-strength">
          <div class="name">強みの説明</div>
          <div class="description">強みの項目をポイントするとすると、ここに説明が出るよ🤩</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import strengths from '~/data/strengths.json'
import strengthDescriptions from '~/data/strength-descriptions.json'
import draggable from 'vuedraggable'
import { getPDFText } from '~/utils/pdf'
import { extractStrengths } from '~/utils/strength-finder'

const KEY_MEMBERS = 'sfv_members'

export default {
  name: 'app',
  components: {
    draggable
  },
  computed: {
    strengths() {
      return strengths
    },
    color() {
      return str => {
        const s = strengths.find(s => s.name === str)
        if (s) {
          return s.color
        }
        return '#000'
      }
    },
    selectedStrength() {
      return strengthDescriptions.find(s => s.name === this.highlightStr)
    }
  },
  data() {
    return {
      highlightStr: '',
      members: [],
      hovered: false
    }
  },
  mounted() {
    this.loadMembers()
  },
  methods: {
    onEnter(str) {
      this.highlightStr = str
    },
    onFileDragOver(e) {
      if (this.hovered) {
        return
      }
      console.log(e.dataTransfer.files.length)
      if (e.dataTransfer.files.length > 0) {
        e.dataTransfer.dropEffect = 'copy'
        this.hovered = true
      }
    },
    onFileDragLeave(e) {
      if (!this.hovered) {
        return
      }
      e.dataTransfer.dropEffect = undefined
      this.hovered = false
    },
    async parsePdf(e) {
      this.hovered = false
      if (e.type !== 'drop') {
        return
      }
      const files = e.dataTransfer.files
      for (let file of files) {
        if (file.type === 'application/pdf') {
          const text = await getPDFText(file)
          console.log(text)
          const strs = extractStrengths(text)
          if (strs && strs.length > 0) {
            this.members.push({ name: file.name.replace('.pdf', ''), strs })
          }
        }
      }
      this.saveMembers()
    },
    remove(member) {
      this.members = this.members.filter(m => m !== member)
      this.saveMembers()
    },
    memberChanged() {
      this.saveMembers()
    },
    loadMembers() {
      const json = localStorage.getItem(KEY_MEMBERS)
      if (json) {
        this.members = JSON.parse(json)
      }
    },
    saveMembers() {
      localStorage.setItem(KEY_MEMBERS, JSON.stringify(this.members))
    }
  }
}
</script>

<style lang="scss" scoped>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  min-height: 100vh;
  font-family: 'Helvetica Neue', Helvetica, Arial, Hiragino Kaku Gothic ProN,
    ヒラギノ角ゴシック, ヒラギノ角ゴ Pro W3, Helvetica, Arial, メイリオ, Meiryo,
    ＭＳ Ｐゴシック, sans-serif;
}
.no-content {
  position: fixed;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  font-size: 50px;
}
.members-list {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}
.member-container {
  margin-top: 150px;
  padding: 10px;
}

.member-header {
  display: flex;
  justify-content: space-between;
  .button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    outline: none;
    padding: 0;
    appearance: none;
    color: #ba5032;
  }
  .name {
    font-size: 15px;
    width: 200px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    /* autoprefixer: ignore next */
    -webkit-box-orient: vertical;
    word-break: break-all;
  }
}

.str {
  padding: 2px 8px;
  text-align: left;
  &.top5 {
    font-size: 20px;
    font-weight: bold;
  }
  &.top10 {
    font-size: 14px;
    font-weight: bold;
  }
  background-color: #f0f0f0;
  font-size: 10px;
  font-weight: initial;
  border-left: solid 4px;
  min-width: 180px;
  &.highlight {
    color: orange;
  }
  &.hide-bar {
    border: none;
  }
}
.selected-strength-container {
  position: fixed;
  width: 100%;
  top: 0;
  display: flex;
  justify-content: center;
  .selected-strength {
    max-width: 800px;
    max-height: 200px;
    background-color: rgba(#fff, 0.5);
    padding: 30px;
    .name {
      font-weight: bold;
    }
    .description {
      text-align: left;
    }
  }
}
</style>
