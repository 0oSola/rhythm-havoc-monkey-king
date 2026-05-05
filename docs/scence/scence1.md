Phase 0 开场剧情
黑屏，白色字幕：
然后渐显展示场景空镜：
src\assets\origin\图片素材\第一关图片\bg-1.png
悟空鬼鬼祟祟的从右侧进入画面，往南天门走：
src\assets\origin\图片素材\第一关图片\wukong-run.PNG
随后门卫在南天门口渐显出现：
src/assets/origin/图片素材/第一关图片/npc-init.png
画面下方出现对话框：
门卫：“Oi——什么人？”（按钮提示：按A）
悟空：“俺是堂堂花果山水帘洞美猴王孙——”（按钮提示：按A）
门卫：“管你是谁，要过南天门，先跟我学礼仪 (｀Д´)”（按钮提示：按A）
悟空：“啊？什么礼仪？”（按钮提示：按A）
（画面黑，进入Phase1）
Phase 1 基础教学
src\assets\origin\图片素材\第一关图片\bg-1-sample.png
画面下方出现对话框：
门卫：“你先学会立正，按A”
（玩家按A时，悟空播放pic/lever-1/wukong-attention-loop.png循环帧）
（当玩家按了3次后，门卫才会说以下台词：
门卫：“就是这样，再按几次，我们就跟节奏来。”
（当玩家又按了6次后，画面黑）
此时响起练习BGM：music/LEVEL1-BPM100-2bar-practice.wav 循环播放
门卫、悟空跟随BGM的节奏进入待机呼吸状态。
（门卫待机状态：pic/lever-1/npc-init-loop.png）
（悟空待机状态：pic/lever-1/wukong-init-loop.png）
画面下方对话框提示：
门卫：“跟着我的节奏来，还有{n}次。”
（进入循环练习，总共3次）
循环参数
// Phase 1：基础教学（立正）
// 目标：玩家学会 A = 立正

const phase1PracticeConfig = {
  phase: 1,
  name: "基础教学：立正",

  bpm: 100, // 每分钟100拍
  timeSignature: [4, 4], // 4/4拍
  beatMs: 600, // 1拍 = 600ms
  barMs: 2400, // 1小节 = 2400ms
  loopBars: 2, // 一次练习为2个小节
  loopDurationMs: 4800, // 2小节WAV播放一次的总时长

  audio: {
    fileName: "LEVEL1-BPM100-2bar-practice.wav",
    loop: true
  },

  // 第1小节：NPC示范
  npcBar: 1,

  // 第2小节：玩家模仿
  playerBar: 2,

  requiredPassCount: 3, // 需要连续/累计通过3次，进入Phase 2

  actions: {
    ATTENTION: {
      name: "立正",
      keys: ["A"]
    }
  },

  // NPC示范：第1小节，第1拍和第3拍立正
  npcDemoEvents: [
    {
      timeMs: 0,
      bar: 1,
      beat: 1,
      action: "ATTENTION",
      keys: ["A"]
    },
    {
      timeMs: 1200,
      bar: 1,
      beat: 3,
      action: "ATTENTION",
      keys: ["A"]
    }
  ],

  // 玩家模仿：第2小节，第1拍和第3拍按A
  playerInputEvents: [
    {
      timeMs: 2400,
      bar: 2,
      beat: 1,
      action: "ATTENTION",
      keys: ["A"],
      requiredJudgement: "PERFECT"
    },
    {
      timeMs: 3600,
      bar: 2,
      beat: 3,
      action: "ATTENTION",
      keys: ["A"],
      requiredJudgement: "PERFECT"
    }
  ],

  passCondition: {
    description: "玩家在2400ms和3600ms两个Perfect节点都按到A",
    type: "ALL_PLAYER_EVENTS_PERFECT",
    requiredEventTimesMs: [2400, 3600],
    requiredKeys: ["A"]
  },

  onLoopPass: {
    description: "通过1次后，phase1SuccessCount += 1",
    action: "INCREMENT_SUCCESS_COUNT",
    targetVariable: "phase1SuccessCount",
    amount: 1
  },

  onRequiredPassCountReached: {
    description: "达到3次后，进入Phase 2",
    condition: "phase1SuccessCount >= requiredPassCount",
    action: "GO_TO_PHASE",
    nextPhase: 2
  },

  onLoopFail: {
    description: "没通过时，当前2小节WAV播放完，也就是到4800ms后，重新播放同一个WAV并重试",
    action: "WAIT_UNTIL_LOOP_END_THEN_RETRY",
    retryAtMs: 4800,
    resetCurrentLoopResult: true
  }
};
单次循环结构
暂时无法在飞书文档外展示此内容
3次循环通过后，画面下方对话框提示：
门卫：“不错，还算有天赋，接下来跟我学敬礼，同时按A和B。”
（玩家按了三次“A+B”后）
门卫：“就是这样，那么，跟节奏来吧。”
（进入循环练习，总共3次）
Phase 2：进阶教学
再次响起练习BGM：music/LEVEL1-BPM100-2bar-practice.wav 循环播放
门卫、悟空跟随BGM的节奏进入待机呼吸状态。
（门卫待机状态：pic/lever-1/npc-init-loop.png）
（悟空待机状态：pic/lever-1/wukong-init-loop.png）
画面下方对话框提示：
门卫：“注意我的节奏，还有{n}次。”
（类似Phase1进入循环练习，同样有3次）
单次循环结构
暂时无法在飞书文档外展示此内容
（通关逻辑类似Phase1，玩家需要在2400ms和4800ms按到对应按键）
3次练习都通过后，画面下方对话框提示：
门卫：“不错，那么，我们开始正式考核了。”
（进入Phase3）
Phase 3 正式检查（开始游戏）
播放音频：lever1-BPM100-34bar.wav
节拍：4/4，BPM=100
音效对应关系：
NPC立正：NPC-attention.wav
NPC敬礼：NPC- salute.wav
PLAYER立正：PLAYER-attention.wav
PLAYER敬礼：PLAYER-salute.wav
PLAYER按错了：PLAYER-failed.wav
暂时无法在飞书文档外展示此内容

{
  "bpm": 100,
  "timeSignature": [4, 4],
  "beatMs": 600,
  "barMs": 2400,
  "totalBars": 34,
  "actions": {
    "ATTENTION": {
      "name": "立正",
      "keys": ["A"]
    },
    "SALUTE": {
      "name": "敬礼",
      "keys": ["A", "B"]
    }
  },
  "notes": [
    "第1-2小节只听鼓点，不做动作。",
    "第3-18小节采用1小节NPC示范、1小节玩家模仿。",
    "第19-22小节采用2小节NPC示范、2小节玩家模仿。",
    "第23-24小节回到1小节NPC示范、1小节玩家模仿，作为进入鼓点break前的过渡。",
    "第25-26小节是纯鼓点break，不做NPC示范，也不做玩家输入。",
    "第27-34小节回到1小节NPC示范、1小节玩家模仿，作为结尾复习。"
  ],
  "bars": [
    {
      "bar": 1,
      "role": "NONE",
      "startTimeMs": 0,
      "endTimeMs": 2400,
      "events": []
    },
    {
      "bar": 2,
      "role": "NONE",
      "startTimeMs": 2400,
      "endTimeMs": 4800,
      "events": []
    },
    {
      "bar": 3,
      "role": "NPC",
      "startTimeMs": 4800,
      "endTimeMs": 7200,
      "events": [
        {
          "beat": 1,
          "timeMs": 4800,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 3,
          "timeMs": 6000,
          "action": "ATTENTION",
          "keys": ["A"]
        }
      ]
    },
    {
      "bar": 4,
      "role": "PLAYER",
      "startTimeMs": 7200,
      "endTimeMs": 9600,
      "events": [
        {
          "beat": 1,
          "timeMs": 7200,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 3,
          "timeMs": 8400,
          "action": "ATTENTION",
          "keys": ["A"]
        }
      ]
    },
    {
      "bar": 5,
      "role": "NPC",
      "startTimeMs": 9600,
      "endTimeMs": 12000,
      "events": [
        {
          "beat": 1,
          "timeMs": 9600,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 3,
          "timeMs": 10800,
          "action": "SALUTE",
          "keys": ["A", "B"]
        }
      ]
    },
    {
      "bar": 6,
      "role": "PLAYER",
      "startTimeMs": 12000,
      "endTimeMs": 14400,
      "events": [
        {
          "beat": 1,
          "timeMs": 12000,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 3,
          "timeMs": 13200,
          "action": "SALUTE",
          "keys": ["A", "B"]
        }
      ]
    },
    {
      "bar": 7,
      "role": "NPC",
      "startTimeMs": 14400,
      "endTimeMs": 16800,
      "events": [
        {
          "beat": 1,
          "timeMs": 14400,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 2.5,
          "timeMs": 15300,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 3,
          "timeMs": 15600,
          "action": "SALUTE",
          "keys": ["A", "B"]
        }
      ]
    },
    {
      "bar": 8,
      "role": "PLAYER",
      "startTimeMs": 16800,
      "endTimeMs": 19200,
      "events": [
        {
          "beat": 1,
          "timeMs": 16800,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 2.5,
          "timeMs": 17700,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 3,
          "timeMs": 18000,
          "action": "SALUTE",
          "keys": ["A", "B"]
        }
      ]
    },
    {
      "bar": 9,
      "role": "NPC",
      "startTimeMs": 19200,
      "endTimeMs": 21600,
      "events": [
        {
          "beat": 1,
          "timeMs": 19200,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 2.5,
          "timeMs": 20100,
          "action": "SALUTE",
          "keys": ["A", "B"]
        },
        {
          "beat": 4,
          "timeMs": 21000,
          "action": "ATTENTION",
          "keys": ["A"]
        }
      ]
    },
    {
      "bar": 10,
      "role": "PLAYER",
      "startTimeMs": 21600,
      "endTimeMs": 24000,
      "events": [
        {
          "beat": 1,
          "timeMs": 21600,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 2.5,
          "timeMs": 22500,
          "action": "SALUTE",
          "keys": ["A", "B"]
        },
        {
          "beat": 4,
          "timeMs": 23400,
          "action": "ATTENTION",
          "keys": ["A"]
        }
      ]
    },
    {
      "bar": 11,
      "role": "NPC",
      "startTimeMs": 24000,
      "endTimeMs": 26400,
      "events": [
        {
          "beat": 1,
          "timeMs": 24000,
          "action": "SALUTE",
          "keys": ["A", "B"]
        },
        {
          "beat": 3,
          "timeMs": 25200,
          "action": "ATTENTION",
          "keys": ["A"]
        }
      ]
    },
    {
      "bar": 12,
      "role": "PLAYER",
      "startTimeMs": 26400,
      "endTimeMs": 28800,
      "events": [
        {
          "beat": 1,
          "timeMs": 26400,
          "action": "SALUTE",
          "keys": ["A", "B"]
        },
        {
          "beat": 3,
          "timeMs": 27600,
          "action": "ATTENTION",
          "keys": ["A"]
        }
      ]
    },
    {
      "bar": 13,
      "role": "NPC",
      "startTimeMs": 28800,
      "endTimeMs": 31200,
      "events": [
        {
          "beat": 1,
          "timeMs": 28800,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 2.5,
          "timeMs": 29700,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 4,
          "timeMs": 30600,
          "action": "SALUTE",
          "keys": ["A", "B"]
        }
      ]
    },
    {
      "bar": 14,
      "role": "PLAYER",
      "startTimeMs": 31200,
      "endTimeMs": 33600,
      "events": [
        {
          "beat": 1,
          "timeMs": 31200,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 2.5,
          "timeMs": 32100,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 4,
          "timeMs": 33000,
          "action": "SALUTE",
          "keys": ["A", "B"]
        }
      ]
    },
    {
      "bar": 15,
      "role": "NPC",
      "startTimeMs": 33600,
      "endTimeMs": 36000,
      "events": [
        {
          "beat": 1,
          "timeMs": 33600,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 3,
          "timeMs": 34800,
          "action": "SALUTE",
          "keys": ["A", "B"]
        }
      ]
    },
    {
      "bar": 16,
      "role": "PLAYER",
      "startTimeMs": 36000,
      "endTimeMs": 38400,
      "events": [
        {
          "beat": 1,
          "timeMs": 36000,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 3,
          "timeMs": 37200,
          "action": "SALUTE",
          "keys": ["A", "B"]
        }
      ]
    },
    {
      "bar": 17,
      "role": "NPC",
      "startTimeMs": 38400,
      "endTimeMs": 40800,
      "events": [
        {
          "beat": 1,
          "timeMs": 38400,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 2,
          "timeMs": 39000,
          "action": "SALUTE",
          "keys": ["A", "B"]
        },
        {
          "beat": 3.5,
          "timeMs": 39900,
          "action": "ATTENTION",
          "keys": ["A"]
        }
      ]
    },
    {
      "bar": 18,
      "role": "PLAYER",
      "startTimeMs": 40800,
      "endTimeMs": 43200,
      "events": [
        {
          "beat": 1,
          "timeMs": 40800,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 2,
          "timeMs": 41400,
          "action": "SALUTE",
          "keys": ["A", "B"]
        },
        {
          "beat": 3.5,
          "timeMs": 42300,
          "action": "ATTENTION",
          "keys": ["A"]
        }
      ]
    },
    {
      "bar": 19,
      "role": "NPC",
      "startTimeMs": 43200,
      "endTimeMs": 45600,
      "events": [
        {
          "beat": 1,
          "timeMs": 43200,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 3,
          "timeMs": 44400,
          "action": "SALUTE",
          "keys": ["A", "B"]
        }
      ]
    },
    {
      "bar": 20,
      "role": "NPC",
      "startTimeMs": 45600,
      "endTimeMs": 48000,
      "events": [
        {
          "beat": 1,
          "timeMs": 45600,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 2.5,
          "timeMs": 46500,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 4,
          "timeMs": 47400,
          "action": "SALUTE",
          "keys": ["A", "B"]
        }
      ]
    },
    {
      "bar": 21,
      "role": "PLAYER",
      "startTimeMs": 48000,
      "endTimeMs": 50400,
      "events": [
        {
          "beat": 1,
          "timeMs": 48000,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 3,
          "timeMs": 49200,
          "action": "SALUTE",
          "keys": ["A", "B"]
        }
      ]
    },
    {
      "bar": 22,
      "role": "PLAYER",
      "startTimeMs": 50400,
      "endTimeMs": 52800,
      "events": [
        {
          "beat": 1,
          "timeMs": 50400,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 2.5,
          "timeMs": 51300,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 4,
          "timeMs": 52200,
          "action": "SALUTE",
          "keys": ["A", "B"]
        }
      ]
    },
    {
      "bar": 23,
      "role": "NPC",
      "startTimeMs": 52800,
      "endTimeMs": 55200,
      "events": [
        {
          "beat": 1,
          "timeMs": 52800,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 2.5,
          "timeMs": 53700,
          "action": "SALUTE",
          "keys": ["A", "B"]
        },
        {
          "beat": 4,
          "timeMs": 54600,
          "action": "ATTENTION",
          "keys": ["A"]
        }
      ]
    },
    {
      "bar": 24,
      "role": "PLAYER",
      "startTimeMs": 55200,
      "endTimeMs": 57600,
      "events": [
        {
          "beat": 1,
          "timeMs": 55200,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 2.5,
          "timeMs": 56100,
          "action": "SALUTE",
          "keys": ["A", "B"]
        },
        {
          "beat": 4,
          "timeMs": 57000,
          "action": "ATTENTION",
          "keys": ["A"]
        }
      ]
    },
    {
      "bar": 25,
      "role": "NONE",
      "startTimeMs": 57600,
      "endTimeMs": 60000,
      "events": []
    },
    {
      "bar": 26,
      "role": "NONE",
      "startTimeMs": 60000,
      "endTimeMs": 62400,
      "events": []
    },
    {
      "bar": 27,
      "role": "NPC",
      "startTimeMs": 62400,
      "endTimeMs": 64800,
      "events": [
        {
          "beat": 1,
          "timeMs": 62400,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 3,
          "timeMs": 63600,
          "action": "SALUTE",
          "keys": ["A", "B"]
        }
      ]
    },
    {
      "bar": 28,
      "role": "PLAYER",
      "startTimeMs": 64800,
      "endTimeMs": 67200,
      "events": [
        {
          "beat": 1,
          "timeMs": 64800,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 3,
          "timeMs": 66000,
          "action": "SALUTE",
          "keys": ["A", "B"]
        }
      ]
    },
    {
      "bar": 29,
      "role": "NPC",
      "startTimeMs": 67200,
      "endTimeMs": 69600,
      "events": [
        {
          "beat": 1,
          "timeMs": 67200,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 2.5,
          "timeMs": 68100,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 3,
          "timeMs": 68400,
          "action": "SALUTE",
          "keys": ["A", "B"]
        }
      ]
    },
    {
      "bar": 30,
      "role": "PLAYER",
      "startTimeMs": 69600,
      "endTimeMs": 72000,
      "events": [
        {
          "beat": 1,
          "timeMs": 69600,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 2.5,
          "timeMs": 70500,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 3,
          "timeMs": 70800,
          "action": "SALUTE",
          "keys": ["A", "B"]
        }
      ]
    },
    {
      "bar": 31,
      "role": "NPC",
      "startTimeMs": 72000,
      "endTimeMs": 74400,
      "events": [
        {
          "beat": 1,
          "timeMs": 72000,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 2.5,
          "timeMs": 72900,
          "action": "SALUTE",
          "keys": ["A", "B"]
        },
        {
          "beat": 4,
          "timeMs": 73800,
          "action": "ATTENTION",
          "keys": ["A"]
        }
      ]
    },
    {
      "bar": 32,
      "role": "PLAYER",
      "startTimeMs": 74400,
      "endTimeMs": 76800,
      "events": [
        {
          "beat": 1,
          "timeMs": 74400,
          "action": "ATTENTION",
          "keys": ["A"]
        },
        {
          "beat": 2.5,
          "timeMs": 75300,
          "action": "SALUTE",
          "keys": ["A", "B"]
        },
        {
          "beat": 4,
          "timeMs": 76200,
          "action": "ATTENTION",
          "keys": ["A"]
        }
      ]
    },
    {
      "bar": 33,
      "role": "NPC",
      "startTimeMs": 76800,
      "endTimeMs": 79200,
      "events": [
        {
          "beat": 1,
          "timeMs": 76800,
          "action": "SALUTE",
          "keys": ["A", "B"]
        },
        {
          "beat": 3,
          "timeMs": 78000,
          "action": "ATTENTION",
          "keys": ["A"]
        }
      ]
    },
    {
      "bar": 34,
      "role": "PLAYER",
      "startTimeMs": 79200,
      "endTimeMs": 81600,
      "events": [
        {
          "beat": 1,
          "timeMs": 79200,
          "action": "SALUTE",
          "keys": ["A", "B"]
        },
        {
          "beat": 3,
          "timeMs": 80400,
          "action": "ATTENTION",
          "keys": ["A"]
        }
      ]
    }
  ]
}
游戏结算
天尊 结算
门卫肃然起敬：
“好！此人可替我值班！”

真仙 结算
门卫点头：
“不错，像练过的。”

道童 结算
门卫叹气：
“手脚倒是齐全。”

凡夫 结算
门卫震怒：
“来人，把他叉出去！”