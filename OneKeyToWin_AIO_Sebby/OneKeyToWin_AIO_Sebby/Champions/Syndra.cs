﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LeagueSharp;
using LeagueSharp.Common;
using SharpDX;

namespace OneKeyToWin_AIO_Sebby.Champions
{
    class Syndra
    {
        private Menu Config = Program.Config;
        public static Orbwalking.Orbwalker Orbwalker = Program.Orbwalker;
        public Obj_AI_Hero Player { get { return ObjectManager.Player; } }
        private Spell E, Q, R, W, EQ;
        private float QMANA = 0, WMANA = 0, EMANA = 0, RMANA = 0;
        private Obj_AI_Base LastWObject;
        private static List<Obj_AI_Minion> BallsList = new List<Obj_AI_Minion>();

        public void LoadOKTW()
        {
            Q = new Spell(SpellSlot.Q, 790);
            W = new Spell(SpellSlot.W, 950);
            E = new Spell(SpellSlot.E, 700);
            R = new Spell(SpellSlot.R, 675);
            EQ = new Spell(SpellSlot.Q, Q.Range + 500);

            Q.SetSkillshot(0.6f, 125f, float.MaxValue, false, SkillshotType.SkillshotCircle);
            W.SetSkillshot(0.25f, 140f, 1600f, false, SkillshotType.SkillshotCircle);
            E.SetSkillshot(0.25f, (float)(45 * 0.5), 2500f, false, SkillshotType.SkillshotCircle);
            EQ.SetSkillshot(float.MaxValue, 55f, 2000f, false, SkillshotType.SkillshotCircle);

            Config.SubMenu(Player.ChampionName).SubMenu("Draw").AddItem(new MenuItem("noti", "Show R notification", true).SetValue(true));
            Config.SubMenu(Player.ChampionName).SubMenu("Draw").AddItem(new MenuItem("qRange", "Q range", true).SetValue(false));
            Config.SubMenu(Player.ChampionName).SubMenu("Draw").AddItem(new MenuItem("wRange", "W range", true).SetValue(false));
            Config.SubMenu(Player.ChampionName).SubMenu("Draw").AddItem(new MenuItem("eRange", "E range", true).SetValue(false));
            Config.SubMenu(Player.ChampionName).SubMenu("Draw").AddItem(new MenuItem("rRange", "R range", true).SetValue(false));
            Config.SubMenu(Player.ChampionName).SubMenu("Draw").AddItem(new MenuItem("onlyRdy", "Draw when skill rdy", true).SetValue(true));

            Config.SubMenu(Player.ChampionName).SubMenu("Q Config").AddItem(new MenuItem("autoQ", "Auto Q", true).SetValue(true));
            Config.SubMenu(Player.ChampionName).SubMenu("Q Config").AddItem(new MenuItem("harrasQ", "Harass Q", true).SetValue(true));
            Config.SubMenu(Player.ChampionName).SubMenu("Q Config").AddItem(new MenuItem("QHarassMana", "Harass Mana", true).SetValue(new Slider(30, 100, 0)));

            foreach (var enemy in ObjectManager.Get<Obj_AI_Hero>().Where(enemy => enemy.IsEnemy))
                Config.SubMenu(Player.ChampionName).SubMenu("Q Config").SubMenu("Use on:").AddItem(new MenuItem("Qon" + enemy.ChampionName, enemy.ChampionName).SetValue(true));

            Config.SubMenu(Player.ChampionName).SubMenu("W Config").AddItem(new MenuItem("autoW", "Auto W", true).SetValue(true));
            Config.SubMenu(Player.ChampionName).SubMenu("W Config").AddItem(new MenuItem("harrasW", "Harass W", true).SetValue(false));
            Config.SubMenu(Player.ChampionName).SubMenu("W Config").AddItem(new MenuItem("WmodeCombo", "W combo mode", true).SetValue(new StringList(new[] { "always", "run - cheese" }, 1)));
            Config.SubMenu(Player.ChampionName).SubMenu("W Config").SubMenu("W Gap Closer").AddItem(new MenuItem("WmodeGC", "Gap Closer position mode", true).SetValue(new StringList(new[] { "Dash end position", "My hero position" }, 0)));
            foreach (var enemy in ObjectManager.Get<Obj_AI_Hero>().Where(enemy => enemy.IsEnemy))
                Config.SubMenu(Player.ChampionName).SubMenu("W Config").SubMenu("W Gap Closer").SubMenu("Cast on enemy:").AddItem(new MenuItem("WGCchampion" + enemy.ChampionName, enemy.ChampionName, true).SetValue(true));

            Config.SubMenu(Player.ChampionName).SubMenu("E Config").AddItem(new MenuItem("autoE", "Auto E if enemy in range", true).SetValue(true));
            Config.SubMenu(Player.ChampionName).SubMenu("E Config").AddItem(new MenuItem("Emana", "E % minimum mana", true).SetValue(new Slider(20, 100, 0)));

            Config.SubMenu(Player.ChampionName).SubMenu("R Config").AddItem(new MenuItem("autoR", "Auto R", true).SetValue(true));

            foreach (var enemy in ObjectManager.Get<Obj_AI_Hero>().Where(enemy => enemy.IsEnemy))
                Config.SubMenu(Player.ChampionName).SubMenu("Harras").AddItem(new MenuItem("harras" + enemy.ChampionName, enemy.ChampionName).SetValue(true));

            Config.SubMenu(Player.ChampionName).SubMenu("Farm").AddItem(new MenuItem("farmQout", "Last hit Q minion out range AA", true).SetValue(true));
            Config.SubMenu(Player.ChampionName).SubMenu("Farm").AddItem(new MenuItem("farmQ", "Lane clear Q", true).SetValue(true));
            Config.SubMenu(Player.ChampionName).SubMenu("Farm").AddItem(new MenuItem("farmE", "Lane clear E", true).SetValue(true));
            Config.SubMenu(Player.ChampionName).SubMenu("Farm").AddItem(new MenuItem("Mana", "LaneClear Mana", true).SetValue(new Slider(80, 100, 0)));
            Config.SubMenu(Player.ChampionName).SubMenu("Farm").AddItem(new MenuItem("QLCminions", " QLaneClear minimum minions", true).SetValue(new Slider(2, 10, 0)));
            Config.SubMenu(Player.ChampionName).SubMenu("Farm").AddItem(new MenuItem("ELCminions", " ELaneClear minimum minions", true).SetValue(new Slider(5, 10, 0)));
            Config.SubMenu(Player.ChampionName).SubMenu("Farm").AddItem(new MenuItem("jungleQ", "Jungle clear Q", true).SetValue(true));
            Config.SubMenu(Player.ChampionName).SubMenu("Farm").AddItem(new MenuItem("jungleE", "Jungle clear E", true).SetValue(true));


            Spellbook.OnCastSpell += Spellbook_OnCastSpell;
            Game.OnUpdate += Game_OnGameUpdate;
            GameObject.OnCreate += Obj_AI_Base_OnCreate;
            Drawing.OnDraw += Drawing_OnDraw;
        }

        private void Spellbook_OnCastSpell(Spellbook sender, SpellbookCastSpellEventArgs args)
        {
            if (args.Slot == SpellSlot.E)
            {
                if (Q.IsReady())
                    Q.Cast(args.StartPosition);
            }
        }

        private void Obj_AI_Base_OnCreate(GameObject sender, EventArgs args)
        {
            if (sender.IsAlly && sender.Type == GameObjectType.obj_AI_Minion && sender.Name == "Seed")
            {
                var ball = sender as Obj_AI_Minion;
                BallsList.Add(ball);
            }
        }

        private void Game_OnGameUpdate(EventArgs args)
        {
            if (Program.LagFree(1))
            { 
                SetMana();
                if (BallsList.Count > 0)
                { 
                    BallsList.RemoveAll(ball => !ball.IsValid || ball.Mana == 19);
                }
            }

            if (Program.LagFree(1) && Q.IsReady() && Config.Item("autoQ", true).GetValue<bool>())
                LogicQ();

            if (Program.LagFree(2) && E.IsReady() && Config.Item("autoE", true).GetValue<bool>())
                LogicE();

            if (Program.LagFree(3) && W.IsReady() && Config.Item("autoW", true).GetValue<bool>())
                LogicW();

            if (Program.LagFree(4) && R.IsReady() && Config.Item("autoR", true).GetValue<bool>())
                LogicR();
        }

        private void LogicE()
        {
            
        }

        private void LogicR()
        {
            foreach (var enemy in Program.Enemies.Where(enemy => enemy.IsValidTarget(R.Range)))
            {
                if (enemy.Health < OktwCommon.GetKsDamage(enemy, R)  )
                {
                    if (enemy.Health - OktwCommon.GetIncomingDamage(enemy) > 0)
                    {
                        if (Q.IsReady() && enemy.Health - OktwCommon.GetIncomingDamage(enemy) > Q.GetDamage(enemy))
                            R.Cast(enemy);
                    }
                }
            }
        }

        private void LogicW()
        {
            if (W.Instance.ToggleState == 1)
            {
                var t = TargetSelector.GetTarget(W.Range, TargetSelector.DamageType.Magical);
                if (t.IsValidTarget())
                {
                    if (OktwCommon.GetKsDamage(t, W) > t.Health)
                        CatchW();
                    if (Program.Combo && Player.Mana > RMANA + QMANA + WMANA)
                        CatchW();
                    if (Program.Farm && Orbwalking.CanAttack() && !Player.IsWindingUp && Config.Item("harrasQ", true).GetValue<bool>()
                        && Config.Item("harras" + t.ChampionName).GetValue<bool>() && Player.ManaPercent > Config.Item("QHarassMana", true).GetValue<Slider>().Value)
                        CatchW();
                }
            }
            else
            {
                W.From = LastWObject.Position;
                var t = TargetSelector.GetTarget(W.Range, TargetSelector.DamageType.Magical);
                if (t.IsValidTarget())
                {
                    Program.CastSpell(W, t);
                }
            }
        }   

        private void LogicQ()
        {
            var t = TargetSelector.GetTarget(Q.Range, TargetSelector.DamageType.Magical);
            if (t.IsValidTarget() && Config.Item("Qon" + t.ChampionName).GetValue<bool>())
            {
                if (OktwCommon.GetKsDamage(t, Q) > t.Health)
                    Program.CastSpell(Q, t);
                if (Program.Combo && Player.Mana > RMANA + QMANA + WMANA)
                    Program.CastSpell(Q, t);
                if (Program.Farm && Orbwalking.CanAttack() && !Player.IsWindingUp && Config.Item("harrasQ", true).GetValue<bool>()
                    && Config.Item("harras" + t.ChampionName).GetValue<bool>() && Player.ManaPercent > Config.Item("QHarassMana", true).GetValue<Slider>().Value)
                    Program.CastSpell(Q, t);
                foreach (var enemy in Program.Enemies.Where(enemy => enemy.IsValidTarget(Q.Range) && !OktwCommon.CanMove(enemy)))
                    Program.CastSpell(Q, t);
            }
            if (Player.IsWindingUp)
                return;

            if (!Program.None && !Program.Combo && Player.Mana > RMANA + QMANA * 2)
            {
                var allMinions = MinionManager.GetMinions(Player.ServerPosition, Q.Range);

                if (Config.Item("farmQout", true).GetValue<bool>())
                {
                    foreach (var minion in allMinions.Where(minion => minion.IsValidTarget(Q.Range) && (!Orbwalker.InAutoAttackRange(minion) || (!minion.UnderTurret(true) && minion.UnderTurret()))))
                    {
                        var hpPred = HealthPrediction.GetHealthPrediction(minion, 1100);
                        if (hpPred < Q.GetDamage(minion) * 0.9 && hpPred > minion.Health - hpPred * 2)
                        {
                            Q.Cast(minion);
                            return;
                        }
                    }
                }

                if (Program.LaneClear && Config.Item("farmQ", true).GetValue<bool>() && Player.ManaPercent > Config.Item("Mana", true).GetValue<Slider>().Value)
                {
                    foreach (var minion in allMinions.Where(minion => minion.IsValidTarget(Q.Range) && Orbwalker.InAutoAttackRange(minion)))
                    {
                        var hpPred = HealthPrediction.GetHealthPrediction(minion, 1100);
                        if (hpPred < Q.GetDamage(minion) * 0.9 && hpPred > minion.Health - hpPred * 2)
                        {
                            Q.Cast(minion);
                            return;
                        }
                    }
                }

                if (Program.LaneClear && Player.ManaPercent > Config.Item("Mana", true).GetValue<Slider>().Value && Config.Item("farmQ", true).GetValue<bool>())
                {
                    var farmPos = Q.GetCircularFarmLocation(allMinions, Q.Width);
                    if (farmPos.MinionsHit >= Config.Item("QLCminions", true).GetValue<Slider>().Value)
                        Q.Cast(farmPos.Position);
                }
            }
        }

        private void CatchW()
        {
            var catchRange = 925;
            Obj_AI_Base obj = null;
            if (BallsList.Count > 0)
            {
                obj = BallsList.Find(ball => ball.Distance(Player) < catchRange);
            }

            if(obj == null)
            {
                obj = MinionManager.GetMinions(Player.ServerPosition, W.Range, MinionTypes.All, MinionTeam.NotAlly, MinionOrderTypes.MaxHealth).FirstOrDefault();
            }
            if (obj != null)
            {
                LastWObject = obj;
                W.Cast(obj.Position);
            }
        }

        private void Drawing_OnDraw(EventArgs args)
        {

        }

        private void SetMana()
        {
            if ((Config.Item("manaDisable", true).GetValue<bool>() && Program.Combo) || Player.HealthPercent < 20)
            {
                QMANA = 0;
                WMANA = 0;
                EMANA = 0;
                RMANA = 0;
                return;
            }

            QMANA = Q.Instance.ManaCost;
            WMANA = W.Instance.ManaCost;
            EMANA = E.Instance.ManaCost;

            if (!R.IsReady())
                RMANA = QMANA - Player.PARRegenRate * Q.Instance.Cooldown;
            else
                RMANA = R.Instance.ManaCost;
        }
    }
}
