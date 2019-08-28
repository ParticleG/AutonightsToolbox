//version:1.0.0
//platform version:7.0.4-1

//程序初始化器
initializer();
        
//导入安卓原生类
importClass(java.lang.Runnable);
importClass(android.animation.ObjectAnimator)
importClass(android.animation.PropertyValuesHolder)
importClass(android.animation.ValueAnimator)
importClass(android.animation.AnimatorSet)
importClass(android.view.animation.AccelerateInterpolator)
importClass(android.view.animation.TranslateAnimation)
importClass(android.animation.ObjectAnimator)
importClass(android.animation.TimeInterpolator)
importClass(android.os.Bundle)
importClass(android.view.View)
importClass(android.view.Window)
importClass(android.view.animation.AccelerateDecelerateInterpolator)
importClass(android.view.animation.AccelerateInterpolator)
importClass(android.view.animation.AnticipateInterpolator)
importClass(android.view.animation.AnticipateOvershootInterpolator)
importClass(android.view.animation.BounceInterpolator)
importClass(android.view.animation.CycleInterpolator)
importClass(android.view.animation.DecelerateInterpolator)
importClass(android.view.animation.LinearInterpolator)
importClass(android.view.animation.OvershootInterpolator)
importClass(android.view.animation.PathInterpolator)
importClass(android.widget.Button)
importClass(android.widget.ImageView)
importClass(android.widget.TextView)

//全局变量
var LocalData = storages.create("AutoNightsToolBoxLocal");
var logo_switch = false;//悬浮窗的开启关闭检测
var logo_buys = false;//开启和关闭时占用状态 防止多次点击触发
var running_action;//正在运行的操作线程
var running_floating_window;//正在运行的悬浮窗
var time_0, time_1, time_3//定时器 点击退出悬浮窗时定时器关闭
var x = 0,y = 0;//记录按键被按下时的触摸坐标
var windowX, windowY; G_Y = 0//记录按键被按下时的悬浮窗位置
var downTime; yd = false;//记录按键被按下的时间以便判断长按等动作

//可修改参数
var logo_ms = 200;//动画播放时间
var DHK_ms = 200;//对话框动画播放时间
var accent_color = LocalData.get("AccentColor");//强调色
var alternative_color = "#BDBDBD"; //副色


/**
 * 需要三个悬浮窗一起协作达到Auto.js悬浮窗效果
 * win  子菜单悬浮窗 处理子菜单选项点击事件
 * win_1  主悬浮按钮 
 * win_2  悬浮按钮动画替身,只有在手指移动主按钮的时候才会被触发 
 * 触发时,替身Y值会跟主按钮Y值绑定一起,手指弹起时代替主按钮显示跳动的小球动画
 */
var win = floaty.rawWindow(
    <frame >//子菜单悬浮窗
        <frame id="id_logo" w="110" h="210" alpha="0"  >
            <frame id="id_0" w="44" h="44" margin="0 0 0 0" alpha="1" visibility="gone">
                <img w="44" h="44" src="#FFFFFF" circle="true" />
                <img w="28" h="28" src="@drawable/ic_perm_identity_black_48dp" tint="#ffffff" gravity="center" layout_gravity="center" />
                <img id="fab_profile" w="*" h="*" src="#ffffff" circle="true" alpha="0" />
            </frame>
            <frame id="id_1" w="44" h="44" margin="16 15 0 0" alpha="1">
                <img w="44" h="44" src="#4caf50" circle="true" />
                <img w="28" h="28" src="@drawable/ic_menu_black_48dp" tint="#ffffff" gravity="center" layout_gravity="center" />
                <img id="fab_action_menu" w="*" h="*" src="#ffffff" circle="true" alpha="0" />
            </frame>
            <frame id="id_2" w="44" h="44" margin="0 52 0 0" alpha="1" gravity="right" layout_gravity="right">
                <img w="44" h="44" src="#ee534f" circle="true" />
                <img w="28" h="28" src="@drawable/ic_stop_black_48dp" tint="#ffffff" margin="8" />
                <img id="fab_stop_action" w="*" h="*" src="#ffffff" circle="true" alpha="0" />
            </frame>
            <frame id="id_3" w="44" h="44" margin="0 112 0 0" alpha="1" gravity="center" layout_gravity="right">
                <img w="44" h="44" src="#40a5f3" circle="true" />
                <img w="28" h="28" src="@drawable/ic_settings_black_48dp" tint="#ffffff" margin="8" />
                <img id="fab_settings_menu" w="*" h="*" src="#ffffff" circle="true" alpha="0" />
            </frame>
            <frame id="id_4" w="44" h="44" margin="16 0 0 15" alpha="1" gravity="bottom" layout_gravity="bottom">
                <img w="44" h="44" src="#bfc1c0" circle="true" />
                <img w="28" h="28" src="@drawable/ic_more_horiz_black_48dp" tint="#ffffff" margin="8" />
                <img id="fab_misc_menu" w="*" h="*" src="#ffffff" circle="true" alpha="0" />
            </frame>
        </frame>
        <frame id="logo" w="44" h="44" marginTop="83" alpha="1" />
        <frame id="logo_1" w="44" h="44" margin="0 83 22 0" alpha="1" layout_gravity="right" />
    </frame>
)
win.setTouchable(false);//设置子菜单不接收触摸消息

var win_1 = floaty.rawWindow(
    <frame id="logo" w="44" h="44" alpha="0.4" >//悬浮按钮
        <img w="44" h="44" src="#ffffff" circle="true" alpha="0.8" />
        <img id="img_logo" w="32" h="32" src="https://raw.githubusercontent.com/ParticleG/AutonightsToolbox/master/src/assets/fabs/fab-128x128.png" gravity="center" layout_gravity="center" />
        <img id="logo_click" w="*" h="*" src="#ffffff" alpha="0" />
    </frame>
);
win_1.setPosition(-21, device.height * 0.1)//悬浮按钮定位

var win_2 = floaty.rawWindow(
    <frame id="logo" w="{{device.width}}px" h="44" alpha="0" >//悬浮按钮 弹性替身
        <img w="44" h="44" src="#ffffff" circle="true" alpha="0.8" />
        <img id="img_logo" w="32" h="32" src="https://raw.githubusercontent.com/ParticleG/AutonightsToolbox/master/src/assets/fabs/fab-128x128.png" margin="6 6" />
    </frame>
);
win_2.setTouchable(false);//设置弹性替身不接收触摸消息

/**
 * 脚本广播事件
 */
var XY = [], XY1 = [], TT = [], TT1 = [], img_dp = {}, dpZ = 0, logo_right = 0, dpB = 0, dp_H = 0
events.broadcast.on("定时器关闭", function (X) { clearInterval(X) })
events.broadcast.on("悬浮开关", function (X) {
    ui.run(function () {
        switch (X) {
            case true:
                win.id_logo.setVisibility(0)
                win.setTouchable(true);
                logo_switch = true
                break;
            case false:
                win.id_logo.setVisibility(4)
                win.setTouchable(false);
                logo_switch = false
        }
    })

});

events.broadcast.on("悬浮显示", function (X1) {
    ui.run(function () {
        win_2.logo.attr("alpha", "0");
        win_1.logo.attr("alpha", "0.4");
    })
});

var terid = setInterval(() => { //等待悬浮窗初始化
    //log("13")
    if (TT.length == 0 && win.logo.getY() > 0) {// 不知道界面初始化的事件  只能放到这里将就下了
        ui.run(function () {
            TT = [win.logo.getX(), win.logo.getY()], TT1 = [win.logo_1.getLeft(), win.logo_1.getTop()], anX = [], anY = []// 获取logo 绝对坐标
            XY = [
                [win.id_0, TT[0] - win.id_0.getX(), TT[1] - win.id_0.getY()],//  获取子菜单 视图和子菜单与logo绝对坐标差值
                [win.id_1, TT[0] - win.id_1.getX(), TT[1] - win.id_1.getY()],
                [win.id_2, TT[0] - win.id_2.getX(), TT[1] - win.id_2.getY()],
                [win.id_3, TT[0] - win.id_3.getX(), TT[1] - win.id_3.getY()],
                [win.id_4, TT[0] - win.id_4.getX(), TT[1] - win.id_4.getY()]]
            //log("上下Y值差值:" + XY[0][2] + "DP值:" + (XY[0][2] / 83))
            dpZ = XY[0][2] / 83
            dpB = dpZ * 22
            XY1 = [
                [parseInt(dpZ * 41), TT1[0] - win.id_0.getLeft(), TT1[1] - win.id_0.getTop()],
                [parseInt(dpZ * -65), TT1[0] - win.id_1.getLeft(), TT1[1] - win.id_1.getTop()],
                [parseInt(dpZ * -106), TT1[0] - win.id_2.getLeft(), TT1[1] - win.id_2.getTop()],
                [parseInt(dpZ * -65), TT1[0] - win.id_3.getLeft(), TT1[1] - win.id_3.getTop()],
                [parseInt(dpZ * 41), TT1[0] - win.id_4.getLeft(), TT1[1] - win.id_4.getTop()]]
            img_dp.h_b = XY[0][2]//两个悬浮窗Y差值
            img_dp.w = parseInt(dpZ * 9)//计算logo左边隐藏时 X值
            img_dp.ww = parseInt(dpZ * (44 - 9))//计算logo右边隐藏时 X值
            logo_right = win.id_2.getX() - parseInt(dpZ * 22)
            win_1.setPosition(0 - img_dp.w, device.height * 0.1)
            win.id_logo.setVisibility(4)
            win.id_logo.attr("alpha", "1")
            events.broadcast.emit("定时器关闭", terid)
        })
        
    }
}, 100)
time_0 = setInterval(() => {
}, 1000)
win_1.logo.setOnTouchListener(function (view, event) {
    if (logo_buys) { return false}
    //event.getAction())
    switch (event.getAction()) {
        case event.ACTION_DOWN:
            x = event.getRawX();
            y = event.getRawY();
            windowX = win_1.getX();
            windowY = win_1.getY();
            downTime = new Date().getTime();
            return true;
        case event.ACTION_MOVE:
            if (logo_switch) { return true; }
            if (!yd) {//如果移动的距离大于h值 则判断为移动 yd为真
                if (Math.abs(event.getRawY() - y) > 30 || Math.abs(event.getRawX() - x) > 30) { win_1.logo.attr("alpha", "1"); yd = true }
            } else {//移动手指时调整两个悬浮窗位置
                win_1.setPosition(windowX + (event.getRawX() - x),//悬浮按钮定位
                    windowY + (event.getRawY() - y));
                win_2.setPosition(0, windowY + (event.getRawY() - y));//弹性 替身定位(隐藏看不到的,松开手指才会出现)
            }
            return true;
        case event.ACTION_UP:                //手指弹起
            //触摸时间小于 200毫秒 并且移动距离小于30 则判断为 点击
            if (logo_buys) { return false;}//如果在动画正在播放中则退出事件 无操作
            if (Math.abs(event.getRawY() - y) < 30 && Math.abs(event.getRawX() - x) < 30) {
                //toastLog("点击弹起")
                if (logo_switch) {
                    logo_switch = false
                    win_1.logo.attr("alpha", "0.4")
                }
                else
                {
                    //log("左边")
                    win.setPosition(windowX + (event.getRawX() - x),
                        windowY + (event.getRawY() - y) - img_dp.h_b);
                    win.id_logo.setVisibility(0)
                    logo_switch = true
                    win_1.logo.attr("alpha", "0.9")
                }
                animationCreator()
            } else if (!logo_switch) {
                //toastLog("移动弹起")
                G_Y = windowY + (event.getRawY() - y)
                win_1.logo.attr("alpha", "0.4")
                //toastLog("左边")
                animator = ObjectAnimator.ofFloat(win_2.logo, "translationX", windowX + (event.getRawX() - x), 0 - img_dp.w);
                mTimeInterpolator = new BounceInterpolator();
                animator.setInterpolator(mTimeInterpolator);
                animator.setDuration(300);
                win_2.logo.attr("alpha", "0.4")//animationCreator 替身上场
                win_1.logo.attr("alpha", "0");//悬浮按钮隐藏
                win_1.setPosition(0 - img_dp.w, G_Y)//悬浮按钮移动到终点位置等待替身动画结束
                animator.start();
                
                threads.start(function () {//动画的结束事件一直没有明白 只能拿线程代替了
                    logo_buys = true
                    sleep(logo_ms + 100)
                    events.broadcast.emit("悬浮显示", 0)

                    logo_buys = false
                });
            }
            yd = false
            return true;
    }
    return true;
});

win.fab_profile.on("click", () => { //禁用
    toastLog("Disabled")
    img_down();
})
win.fab_action_menu.on("click", () => {
    if(running_action == null){
        img_down();
        actionMenu();
    }else{
        toast("有悬浮窗正在运行，请先关闭悬浮窗！");
    }
})

win.fab_stop_action.on("click", () => {
    if(running_action == "Floaty"){
        img_down();
        toast("悬浮窗已关闭！");
        running_floating_window.close();
        device.cancelKeepingAwake();
        running_action = null;
    }
    else
    {
        toast("没有悬浮窗口正在运行！");
    }
})

win.fab_settings_menu.on("click", () => {
    img_down();
    settingsMenu();
})

win.fab_misc_menu.on("click", () => {
    img_down();
    miscMenu();
})

function actionMenu()
{
    let menu = ui.inflate(
        <vertical margin="0">
            <text id="seekbar_value" text="功能菜单" textColor="black" textStyle="bold" textSize="22sp" padding="0 10" gravity="center|left" layout_gravity="center|left"/>
            <frame w="*">
                <frame w="auto">
                    <img gravity="center|center_vertical" layout_gravity="center" w="26" h="26" src="@drawable/ic_person_add_black_48dp" tint="{{accent_color}}"/>
                </frame>
                <button id="hr_helper" text="公开招募助手" paddingLeft="40" gravity="left|center_vertical" layout_gravity="center" w="*" h="60" style="Widget.AppCompat.Button.Borderless" textColor="#000000" textSize="16sp" typeface="normal" />
            </frame>
            <frame w="*">
                <frame w="auto">
                    <img gravity="center|center_vertical" layout_gravity="center" w="26" h="26" src="@drawable/ic_trending_up_black_48dp" tint="{{accent_color}}"/>
                </frame>
                <button id="lvlup_calc" text="升级计算器" paddingLeft="40" gravity="left|center_vertical" layout_gravity="center" w="*" h="60" style="Widget.AppCompat.Button.Borderless" textColor="#000000" textSize="16sp" typeface="normal" />
            </frame>
            <frame w="*">
                <frame w="auto">
                    <img gravity="center|center_vertical" layout_gravity="center" w="26" h="26" src="@drawable/ic_gradient_black_48dp" tint="{{accent_color}}"/>
                </frame>
                <button id="material_calc" text="材料计算器" paddingLeft="40" gravity="left|center_vertical" layout_gravity="center" w="*" h="60" style="Widget.AppCompat.Button.Borderless" textColor="#000000" textSize="16sp" typeface="normal" />
            </frame>
        </vertical>
    );
    var menu_dialog = dialogs.build({
        customView: menu,
        wrapInScrollView: true,    //view高度超过对话框时是否可滑动
        autoDismiss: false,    //按下按钮时是否自动结束对话框
        canceledOnTouchOutside:true    //点击对话框范围外时是否结束对话框
    }).show();

    menu.hr_helper.on("click", () => {
        menu_dialog.dismiss();
        isPlaying();
        running_action = "Floaty";
        HRHelper();
    })
    menu.lvlup_calc.on("click", () => {
        menu_dialog.dismiss();
        isPlaying();
        running_action = "Floaty";
        LvlUpCalc();
    })
    menu.material_calc.on("click", () => {
        menu_dialog.dismiss();
        isPlaying();
        running_action = "Floaty";
        MaterialCalc();
    })
}
function HRHelper(){    //公开招募助手主函数
    var tags_array = baiduOCR();
    var tags = tags_array[0].words + "+" + tags_array[1].words + "+" + tags_array[2].words + "+" + tags_array[3].words + "+" + tags_array[4].words;
    var helper_url = "https://aktools.graueneko.xyz/hr?hidenav=&tags=" + tags + "&hidetags=";
    var helper_window = floaty.rawWindow(
        <horizontal w="*" h="*">
            <button id="button_maximize" w="50px" h="*" text="←" textColor="white" bg="{{accent_color}}" alpha="0.75" style="Widget.AppCompat.Button.Borderless" visibility="gone"/>
            <button id="button_minimize" w="50px" h="*" text="→" textColor="white" bg="{{accent_color}}" alpha="0.75" style="Widget.AppCompat.Button.Borderless"/>
            <webview id="webview" w="*" h="*"/>
        </horizontal>
    );
    running_floating_window = helper_window;
    helper_window.webview.loadUrl(helper_url);
    helper_window.setSize(Math.floor(device.height*0.36), device.width);
    helper_window.setPosition(device.height - Math.floor(device.height*0.36) - 80, 0);
    helper_window.setTouchable(true);
    helper_window.button_minimize.click(function(){
        helper_window.webview.setVisibility(4);
        helper_window.button_minimize.setVisibility(4);
        helper_window.button_maximize.setVisibility(0);
        helper_window.setPosition(device.height - 50 - 80, 0);
    });
    helper_window.button_maximize.click(function(){
        helper_window.webview.setVisibility(0);
        helper_window.button_minimize.setVisibility(0);
        helper_window.button_maximize.setVisibility(4);
        helper_window.setPosition(device.height - Math.floor(device.height*0.36) - 80, 0);
    });

}
function LvlUpCalc(){    //公开招募助手主函数
    var helper_url = "https://aktools.graueneko.xyz/lvlup?hidenav=";
    var helper_window = floaty.rawWindow(
        <horizontal w="*" h="*">
            <button id="button_maximize" w="50px" h="*" text="←" textColor="white" bg="{{accent_color}}" alpha="0.75" style="Widget.AppCompat.Button.Borderless" visibility="gone"/>
            <button id="button_minimize" w="50px" h="*" text="→" textColor="white" bg="{{accent_color}}" alpha="0.75" style="Widget.AppCompat.Button.Borderless"/>
            <webview id="webview" w="*" h="*"/>
        </horizontal>
    );
    running_floating_window = helper_window;
    helper_window.webview.loadUrl(helper_url);
    helper_window.setSize(Math.floor(device.height*0.36), device.width);
    helper_window.setPosition(device.height - Math.floor(device.height*0.36) - 80, 0);
    helper_window.setTouchable(true);
    helper_window.button_minimize.click(function(){
        helper_window.webview.setVisibility(4);
        helper_window.button_minimize.setVisibility(4);
        helper_window.button_maximize.setVisibility(0);
        helper_window.setPosition(device.height - 50 - 80, 0);
    });
    helper_window.button_maximize.click(function(){
        helper_window.webview.setVisibility(0);
        helper_window.button_minimize.setVisibility(0);
        helper_window.button_maximize.setVisibility(4);
        helper_window.setPosition(device.height - Math.floor(device.height*0.36) - 80, 0);
    });

}
function MaterialCalc(){    //公开招募助手主函数
    var helper_url = "https://aktools.graueneko.xyz/material?hidenav=";
    var helper_window = floaty.rawWindow(
        <horizontal w="*" h="*">
            <button id="button_maximize" w="50px" h="*" text="←" textColor="white" bg="{{accent_color}}" alpha="0.75" style="Widget.AppCompat.Button.Borderless" visibility="gone"/>
            <button id="button_minimize" w="50px" h="*" text="→" textColor="white" bg="{{accent_color}}" alpha="0.75" style="Widget.AppCompat.Button.Borderless"/>
            <webview id="webview" w="*" h="*"/>
        </horizontal>
    );
    running_floating_window = helper_window;
    helper_window.webview.loadUrl(helper_url);
    helper_window.setSize(Math.floor(device.height*0.36), device.width);
    helper_window.setPosition(device.height - Math.floor(device.height*0.36) - 80, 0);
    helper_window.setTouchable(true);
    helper_window.button_minimize.click(function(){
        helper_window.webview.setVisibility(4);
        helper_window.button_minimize.setVisibility(4);
        helper_window.button_maximize.setVisibility(0);
        helper_window.setPosition(device.height - 50 - 80, 0);
    });
    helper_window.button_maximize.click(function(){
        helper_window.webview.setVisibility(0);
        helper_window.button_minimize.setVisibility(0);
        helper_window.button_maximize.setVisibility(4);
        helper_window.setPosition(device.height - Math.floor(device.height*0.36) - 80, 0);
    });

}
function baiduOCR(){
    let api_key = "cmLuvbEk78THtWA7UVMueVIV";
    let secret_key = "XsWfCaTXlZLynWMatgPkem58lxvaINyz";
    let access_token_url = "https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id="+api_key+"&client_secret="+secret_key;
    let access_token_res = http.get(access_token_url);
    let access_token_object = access_token_res.body.json();
    //log(access_token_object.access_token);

    let screen = captureScreen();
    let img = images.clip(screen, device.height/2.0-400, device.width/2.0, 750, 200)
    let img_base64 = images.toBase64(img);
    let ocr_url = "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic";

    let ocr_res = http.post(ocr_url, {
        headers: {
            "Content - Type": "application/x-www-form-urlencoded"
        },
        access_token:access_token_object.access_token,
        image: img_base64,
    });
    let ocr_object = ocr_res.body.json();
    return ocr_object.words_result;
}
function isPlaying(){    //判断是否在游戏内
    if (currentPackage() != "com.hypergryph.arknights"){
        launch("com.hypergryph.arknights");
    }
}
function settingsMenu(){    //总设置菜单
    let menu = ui.inflate(
        <vertical margin="0">
            <text id="seekbar_value" text="设置" textColor="black" textStyle="bold" textSize="22sp" padding="0 10" gravity="center|left" layout_gravity="center|left"/>
            <frame w="*">
                <frame w="auto">
                    <img gravity="center|center_vertical" layout_gravity="center" w="26" h="26" src="@drawable/ic_toc_black_48dp" tint="{{accent_color}}"/>
                </frame>
                <button id="floaty_settings" text="悬浮窗样式设置（未完成）" paddingLeft="60" gravity="left|center_vertical" layout_gravity="center" w="*" h="60" style="Widget.AppCompat.Button.Borderless" textColor="#000000" textSize="16sp" typeface="normal" />
            </frame>
            <frame w="*">
                <frame w="auto">
                    <img gravity="center|center_vertical" layout_gravity="center" w="26" h="26" src="@drawable/ic_tune_black_48dp" tint="{{accent_color}}" />
                </frame>
                <button id="other_settings" text="其他设置" paddingLeft="60" gravity="left|center_vertical" layout_gravity="center" w="*" h="60" style="Widget.AppCompat.Button.Borderless" textColor="#000000" textSize="16sp" typeface="normal" />
            </frame>
        </vertical>
    );
    var menu_dialog = dialogs.build({
        customView: menu,
        wrapInScrollView: true,    //view高度超过对话框时是否可滑动
        autoDismiss: false,    //按下按钮时是否自动结束对话框
        canceledOnTouchOutside:true    //点击对话框范围外时是否结束对话框
    }).show();

    menu.floaty_settings.on("click", () => {
        //menu_dialog.dismiss();
        toast("此选项尚未完善！");
    })
    menu.other_settings.on("click", () => {
        menu_dialog.dismiss();
        otherSettings();
    })
}
function otherSettings(){
    let menu = ui.inflate(
        <vertical>
            <text id="title" text="其他设置" textColor="black" textStyle="bold" textSize="22sp" padding="0 10" gravity="center|left" layout_gravity="center|left"/>
            <frame w="*" >
                <frame w="auto">
                    <img gravity="center|center_vertical" layout_gravity="center" w="26" h="26" src="@drawable/ic_color_lens_black_48dp" tint="{{accent_color}}"/>
                </frame>
                <text id="text_accent_color" text="主题色" paddingLeft="60" gravity="left|center_vertical" layout_gravity="center" w="*" h="60" textColor="#000000" textSize="16sp" typeface="normal" />
                <frame marginRight="10" w="auto" h="60" layout_gravity="right">
                    <spinner id="spinner_color_choices" entries="绅士黑|少女粉|灵梦红|咸蛋黄|早苗绿|胖次蓝|基佬紫|夕阳橙|薄荷青"  gravity="center|right" layout_gravity="center|right" textColor="{{accent_color}}"/>
                </frame>
            </frame>
        </vertical>
    );
    switch(LocalData.get("AccentColor")){
        case "#2D2D2D" :
            menu.spinner_color_choices.setSelection(0);
        break;
        case "#FB7299" :
            menu.spinner_color_choices.setSelection(1);
        break;
        case "#F44336" :
            menu.spinner_color_choices.setSelection(2);
        break;
        case "#FFC107" :
            menu.spinner_color_choices.setSelection(3);
        break;
        case "#8BC34A" :
            menu.spinner_color_choices.setSelection(4);
        break;
        case "#2196F3" :
            menu.spinner_color_choices.setSelection(5);
        break;
        case "#9C27B0" :
            menu.spinner_color_choices.setSelection(6);
        break;
        case "#FB8C00" :
            menu.spinner_color_choices.setSelection(7);
        break;
        case "#80DEEA" :
            menu.spinner_color_choices.setSelection(8);
        break;
        default:
            console.error("Exception: Can't set spinner color properly.");
            stop();
        break;
    }
    // 显示对话框
    dialogs.build({
        customView: menu,
        positive: "保存",
        negative: "返回",
        // view高度超过对话框时是否可滑动
        wrapInScrollView: true,
        // 按下按钮时是否自动结束对话框
        autoDismiss: false,
        // 点击对话框范围外时是否结束对话框
        canceledOnTouchOutside:false
    }).on("positive", (dialog) => {
        toast("设置已保存！");
        switch(menu.spinner_color_choices.getSelectedItemPosition()){
            case 0 :
                accent_color = "#2D2D2D"
                LocalData.put("AccentColor", accent_color);
            break;
            case 1 :
                accent_color = "#FB7299"
                LocalData.put("AccentColor", accent_color);
            break;
            case 2 :
                accent_color = "#F44336"
                LocalData.put("AccentColor", accent_color);
            break;
            case 3 :
                accent_color = "#FFC107"
                LocalData.put("AccentColor", accent_color);
            break;
            case 4 :
                accent_color = "#8BC34A"
                LocalData.put("AccentColor", accent_color);
            break;
            case 5 :
                accent_color = "#2196F3"
                LocalData.put("AccentColor", accent_color);
            break;
            case 6 :
                accent_color = "#9C27B0"
                LocalData.put("AccentColor", accent_color);
            break;
            case 7 :
                accent_color = "#FB8C00"
                LocalData.put("AccentColor", accent_color);
            break;
            case 8 :
                accent_color = "#80DEEA"
                LocalData.put("AccentColor", accent_color);
            break;
            default:
                toast("ERROR!");
            break;
        }
        dialog.dismiss();
        otherSettings();
    }).on("negative", (dialog) => {
        dialog.dismiss();
        settingsMenu();
    }).show();
}
function miscMenu(){    //“更多”菜单
    var LocalData = storages.create("AutoNightsToolBoxLocal");
    var cash_avalible = LocalData.get("CashAvalible");
    let menu = ui.inflate(
        <vertical margin="0">
            <text id="seekbar_value" text="更多" textColor="black" textStyle="bold" textSize="22sp" padding="0 10" gravity="center|left" layout_gravity="center|left"/>
            <frame w="*" >
                <frame w="auto">
                    <img gravity="center|center_vertical" layout_gravity="center" w="26" h="26" src="@drawable/ic_accessible_black_48dp" tint="{{accent_color}}" />
                </frame>
                <button id="accessibility" text="无障碍服务设置" paddingLeft="60" gravity="left|center_vertical" layout_gravity="center" w="*" h="60" style="Widget.AppCompat.Button.Borderless" textColor="#000000" textSize="16sp" typeface="normal" />
            </frame>
            <frame w="*">
                <frame w="auto">
                    <img gravity="center|center_vertical" layout_gravity="center" w="26" h="26" src="@drawable/ic_home_black_48dp" tint="{{accent_color}}" />
                </frame>
                <button id="mainpage" text="打开主页面[未完成]" paddingLeft="60" gravity="left|center_vertical" layout_gravity="center" w="*" h="60" style="Widget.AppCompat.Button.Borderless" textColor="#000000" textSize="16sp" typeface="normal" />
            </frame>
            <frame w="*">
                <frame w="auto">
                    <img gravity="center|center_vertical" layout_gravity="center" w="26" h="26" src="@drawable/ic_help_outline_black_48dp" tint="{{accent_color}}" />
                </frame>
                <button id="help" text="使用指南" paddingLeft="60" gravity="left|center_vertical" layout_gravity="center" w="*" h="60" style="Widget.AppCompat.Button.Borderless" textColor="#000000" textSize="16sp" typeface="normal" />
            </frame>
            <frame w="*">
                <frame w="auto">
                    <img gravity="center|center_vertical" layout_gravity="center" w="26" h="26" src="@drawable/ic_info_outline_black_48dp" tint="{{accent_color}}"/>
                </frame>
                <button id="about" text="关于" paddingLeft="60" gravity="left|center_vertical" layout_gravity="center" w="*" h="60" style="Widget.AppCompat.Button.Borderless" textColor="#000000" textSize="16sp" typeface="normal" />
            </frame>
            <frame w="*">
                <frame w="auto">
                    <img gravity="center|center_vertical" layout_gravity="center" w="26" h="26" src="@drawable/ic_exit_to_app_black_48dp" tint="{{accent_color}}" />
                </frame>
                <button id="exit" text="退出自动方舟" paddingLeft="60" gravity="left|center_vertical" layout_gravity="center" w="*" h="60" style="Widget.AppCompat.Button.Borderless" textColor="#000000" textSize="16sp" typeface="normal" />
            </frame>
        </vertical>
    );
    var menu_dialog = dialogs.build({
        customView: menu,
        wrapInScrollView: true,    //view高度超过对话框时是否可滑动
        autoDismiss: false,    //按下按钮时是否自动结束对话框
        canceledOnTouchOutside:true    //点击对话框范围外时是否结束对话框
    }).show();

    menu.accessibility.on("click", () => {
        menu_dialog.dismiss();
        app.startActivity({
            action: "android.settings.ACCESSIBILITY_SETTINGS"
        });
    })
    menu.mainpage.on("click", () => {
        //menu_dialog.dismiss();
        /*
        app.startActivity({
            action: "android.intent.action.VIEW", //此处可为其他值
            packageName: "org.autojs.autojs",
            className: "org.autojs.autojs.ui.splash.SplashActivity"
            //此处可以加入其他内容，如data、extras
        });
        */
       toast("此选项尚未完善！");
    })
    menu.help.on("click", () => {
        menu_dialog.dismiss();
        help_dialog();
    })
    menu.about.on("click", () => {
        menu_dialog.dismiss();
        about_dialog();
    })
    menu.exit.on("click", () => {
        menu_dialog.dismiss();
        if((cash_avalible)&&(Math.floor(Math.random()*10)>=7)){
            cashing_request();
        }else{
            toast("自动方舟已关闭！欢迎下次使用！");
            stop();
        }
    })
}
function cashing_request(){
    var LocalData = storages.create("AutoNightsToolBoxLocal");

    dialogs.build({
        title: "喜欢自动方舟吗？",
        content: "喜欢的话可以给作者打赏一杯奶茶的钱\n你们的支持是我继续前进的动力！",
        checkBoxPrompt: "不再弹出",
        positive:"支付宝",
        negative:"微信",
        neutral:"退出",
        wrapInScrollView: true,    //view高度超过对话框时是否可滑动
        autoDismiss: false,    //按下按钮时是否自动结束对话框
        canceledOnTouchOutside:false    //点击对话框范围外时是否结束对话框
    }).on("positive", (dialog) => {
        dialog.dismiss();
        alipay_dialog();
    }).on("negative", (dialog) => {
        dialog.dismiss();
        micromessege_dialog();
    }).on("neutral", (dialog) => {
        dialog.dismiss();
        toast("自动方舟已关闭！欢迎再次使用！");
        stop();
    }).on("check", (checked)=>{
        LocalData.put("CashAvalible",!checked);
    }).show();
}
function alipay_dialog(){
    let menu = ui.inflate(
        <vertical margin="0">
            <text id="seekbar_value" text="收款码（截图即可）" textColor="black" textStyle="bold" textSize="22sp" padding="0 10" gravity="center|left" layout_gravity="center|left"/>
            <frame w="*" >
                <img gravity="center|center_vertical" layout_gravity="center" w="auto" h="auto" src="https://github.com/ParticleG/AutonightsToolbox/raw/master/src/assets/imgs/alipay_qrcode.png"/>
            </frame>
        </vertical>
    );
    dialogs.build({
        customView: menu,
        positive:"打开支付宝转账",
        neutral:"打开支付宝扫一扫",
        wrapInScrollView: true,    //view高度超过对话框时是否可滑动
        autoDismiss: false,    //按下按钮时是否自动结束对话框
        canceledOnTouchOutside:false    //点击对话框范围外时是否结束对话框
    }).on("positive", (dialog) => {
        dialog.dismiss();
        setClip("gzy1135989508@outlook.com");
        toast("账户名已经复制到剪贴板,点击粘贴即可。感谢您支持自动方舟！");
        app.startActivity({
            packageName: "com.eg.android.AlipayGphone",
            className:"com.alipay.mobile.transferapp.ui.TFToAccountInputActivity_"
        });
        stop();
    }).on("neutral", (dialog) => {
        dialog.dismiss();
        files.copy("./res/qr_code.png", "/storage/emulated/0/Pictures/qr_code.png");
        app.startActivity({
            packageName: "com.eg.android.AlipayGphone",
            className:"com.alipay.mobile.scan.as.main.MainCaptureActivity"
        });
        toast("感谢您支持自动方舟！欢迎再次使用");
        stop();
    }).show();
}
function micromessege_dialog(){
    let menu = ui.inflate(
        <vertical margin="0">
            <text id="seekbar_value" text="赞赏码（截图即可）" textColor="black" textStyle="bold" textSize="22sp" padding="0 10" gravity="center|left" layout_gravity="center|left"/>
            <frame w="*" h="auto" >
                <img gravity="center|center_vertical" layout_gravity="center" w="auto" h="auto" src="https://raw.githubusercontent.com/ParticleG/AutonightsToolbox/master/src/assets/imgs/wechat_qrcode.png" border="0" />"/>
            </frame>
        </vertical>
    );
    dialogs.build({
        customView: menu,
        positive:"打开微信扫一扫",
        wrapInScrollView: true,    //view高度超过对话框时是否可滑动
        autoDismiss: false,    //按下按钮时是否自动结束对话框
        canceledOnTouchOutside:false    //点击对话框范围外时是否结束对话框
    }).on("positive", (dialog) => {
        dialog.dismiss();
        files.copy("./res/appreciation_code.png", "/storage/emulated/0/Pictures/appreciation_code.png");
        app.startActivity({
            packageName: "com.tencent.mm",
            className:"com.tencent.mm.plugin.scanner.ui.BaseScanUI"
        });
        toast("感谢您支持自动方舟！欢迎再次使用");
        stop();
    }).show();
}
function help_dialog(){    //“帮助”对话框
    dialogs.build({
        title: "使用指南",
        content: "1.公开招募助手需要在公招的Tag页面打开，会自动识别tag内容并在悬浮窗内显示\n2.当情况无法控制时，记得按下音量上键结束整个脚本\n3、大部分窗口点击窗口外部就可以关闭，包括主选单",
        positive: "返回",
        neutral: "还有问题？点击观看演示视频",
        wrapInScrollView: true,    //view高度超过对话框时是否可滑动
        autoDismiss: true,    //按下按钮时是否自动结束对话框
        canceledOnTouchOutside:false    //点击对话框范围外时是否结束对话框
    }).on("positive", ()=>{
        miscMenu();
    }).on("neutral", ()=>{
        app.openUrl("https://b23.tv/av61367241");
    }).show();
}
function about_dialog(){    //“关于”对话框
    dialogs.build({
        title: "关于",
        content: "本软件由Auto.js Pro打包制成\n\nAuto.js Pro内核版本号：7.0.4-1\n软件版本号：" + app.versionName + "\n\n作者：Particle_G\n联系方式：QQ：1135989508",
        positive: "返回",
        negative: "加入QQ交流群",
        neutral:"打赏作者",
        wrapInScrollView: true,    //view高度超过对话框时是否可滑动
        autoDismiss: true,    //按下按钮时是否自动结束对话框
        canceledOnTouchOutside:false    //点击对话框范围外时是否结束对话框
    }).on("positive", ()=>{
        miscMenu();
    }).on("negative", ()=>{
        app.openUrl("https://jq.qq.com/?_wv=1027&k=5PX7Evs");
    }).on("neutral", ()=>{
        cashing_request();
    }).show();
}
function initializer(){    //首次运行、权限及配置数据完整性判断
    var LocalData = storages.create("AutoNightsToolBoxLocal");
    //确认应用权限是否被授予
    if (!LocalData.contains("VersionCode")){
        toast("请在接下来的页面里开启本应用的权限");
        console.show();
        console.hide();
        LocalData.put("VersionCode", app.versionCode);
        //stop();
    }else if(LocalData.get("VersionCode") != app.versionCode){
        toast("检测到数据库版本不匹配！已经重置数据库文件夹，请重新运行自动方舟！");
        LocalData.clear();
        stop();
    }
    requestScreenCapture(true);

    //确认主题色配置数据是否存在，不存在则默认设置为“false”
    if (!LocalData.contains("AccentColor")){
        LocalData.put("AccentColor", "#2D2D2D");
    }
    //确认打赏配置数据是否存在，不存在则默认设置为“true”
    if (!LocalData.contains("CashAvalible")){
        LocalData.put("CashAvalible", "true");
    }
}
function img_down() {
    win_1.logo.attr("alpha", "0.4");
    logo_switch = false;
    animationCreator();
}
function animationCreator(){    //补间动画生成
    var anX = [], anY = [], slX = [], slY = []
    if (logo_switch) {
        for (let i = 0; i < XY.length; i++) {
            anX[i] = ObjectAnimator.ofFloat(XY[i][0], "translationX", parseInt(XY[i][1]), 0);
            anY[i] = ObjectAnimator.ofFloat(XY[i][0], "translationY", parseInt(XY[i][2]), 0);
            slX[i] = ObjectAnimator.ofFloat(XY[i][0], "scaleX", 0, 1)
            slY[i] = ObjectAnimator.ofFloat(XY[i][0], "scaleY", 0, 1)
        }
    } else {
        for (let i = 0; i < XY.length; i++) {
            anX[i] = ObjectAnimator.ofFloat(XY[i][0], "translationX", 0, parseInt(XY[i][1]));
            anY[i] = ObjectAnimator.ofFloat(XY[i][0], "translationY", 0, parseInt(XY[i][2]));
            slX[i] = ObjectAnimator.ofFloat(XY[i][0], "scaleX", 1, 0)
            slY[i] = ObjectAnimator.ofFloat(XY[i][0], "scaleY", 1, 0)
        }
    }
    set = new AnimatorSet();
    set.playTogether(
        anX[0], anX[1], anX[2], anX[3], anX[4],
        anY[0], anY[1], anY[2], anY[3], anY[4],
        slX[0], slX[1], slX[2], slX[3], slX[4],
        slY[0], slY[1], slY[2], slY[3], slY[4]);
    set.setDuration(logo_ms);
    threads.start(function () {//动画的结束事件一直没有明白 只能拿线程代替了
        logo_buys = true
        if (logo_switch) {
            //log("开启")
            events.broadcast.emit("悬浮开关", true)
            sleep(logo_ms)
        } else {
            //log("关闭")
            sleep(logo_ms + 100)
            events.broadcast.emit("悬浮开关", false)
        }
        logo_buys = false
    });
    set.start();
}