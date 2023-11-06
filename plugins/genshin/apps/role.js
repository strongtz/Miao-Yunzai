import plugin from '../../../lib/plugins/plugin.js'
import fs from 'node:fs'
import gsCfg from '../model/gsCfg.js'
import RoleIndex from '../model/roleIndex.js'
import Abyss from '../model/abyss.js'
import Weapon from '../model/weapon.js'

export class role extends plugin {
  constructor () {
    super({
      name: '角色查询',
      dsc: '原神角色信息查询',
      event: 'message',
      priority: 200,
      rule: [{
        reg: '^(#*角色3|#*角色卡片|角色)$',
        fnc: 'roleCard'
      }, {
        reg: '^#[上期|往期|本期]*(深渊|深境|深境螺旋)[上期|往期|本期]*[ |0-9]*$',
        fnc: 'abyss'
      }, {
        reg: '^#*[上期|往期|本期]*(深渊|深境|深境螺旋)[上期|往期|本期]*[第]*(9|10|11|12|九|十|十一|十二)层[ |0-9]*$',
        fnc: 'abyssFloor'
      }, {
        reg: '^#[五星|四星|5星|4星]*武器[ |0-9]*$',
        fnc: 'weapon'
      }, {
        reg: '^#(宝箱|成就|尘歌壶|家园|探索|探险|声望|探险度|探索度)[ |0-9]*$',
        fnc: 'roleExplore'
      }]
    })
  }

  /** 初始化配置文件 */
  async init () {

    let pubCk = './plugins/genshin/config/mys.pubCk.yaml'
    if (!fs.existsSync(pubCk)) {
      fs.copyFileSync('./plugins/genshin/defSet/mys/pubCk.yaml', pubCk)
    }

    let set = './plugins/genshin/config/mys.set.yaml'
    if (!fs.existsSync(set)) {
      fs.copyFileSync('./plugins/genshin/defSet/mys/set.yaml', set)
    }
  }

  /** 接受到消息都会先执行一次 */
  accept () {
    if (!this.e.msg) return
    if (!/^#(.*)$/.test(this.e.msg)) return

    let role = gsCfg.getRole(this.e.msg)
    if (role) {
      /** 设置命令 */
      this.e.msg = '#角色详情'
      if (role.uid) this.e.msg += role.uid
      /** 角色id */
      this.e.roleId = role.roleId
      /** 角色名称 */
      this.e.roleName = role.alias
      return true
    }
  }

  /** 深渊 */
  async abyss () {
    let data = await new Abyss(this.e).getAbyss()
    console.log('abyss', data)
    if (!data) return

    this.renderImg('genshin', 'html/abyss/abyss', data)
  }

  /** 深渊十二层 */
  async abyssFloor () {
    let data = await new Abyss(this.e).getAbyssFloor()
    if (!data) return

    await this.renderImg('genshin', 'html/abyssFloor/abyssFloor', data)
  }

  /** 武器 */
  async weapon () {
    let data = await Weapon.get(this.e)
    if (!data) return

    await this.renderImg('genshin', 'html/weapon/weapon', data)
  }

  /** 角色卡片 */
  async roleCard () {
    let data = await new RoleIndex(this.e).roleCard()
    if (!data) return

    await this.renderImg('genshin', 'html/roleCard/roleCard', data)
  }

  /** 探险 */
  async roleExplore () {
    let data = await new RoleIndex(this.e).roleExplore()
    if (!data) return

    this.renderImg('genshin', 'html/roleExplore/roleExplore', data)
  }
}
