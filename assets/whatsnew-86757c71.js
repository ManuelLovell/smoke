import{O as n,C as u}from"./bsConstants-966acf43.js";/* empty css                  */const c=document.querySelector("#bs-whatsnew"),b=document.querySelector("#bs-whatsnew-notes"),p=`
  <div id="newsContainer">
  <div class="title">Smoke & Spectre! Help</div>
  </br>
  <sub>Token Ownership </sub>
  </br>
  <li>If you are logged in and pull a token from your own dock, you are automatically the owner of that token.
  </br>
  <li>You can also have a GM assign you as owner, if the right-click the token in Smoke&Spectre's vision list and click your name.
  </br>
  <li>If your GM is using Clash! they can also assign ownership by right-clicking a unit in the Initiative List.
  </br>
  </br>
  <sub>Token Vision</sub>
  </br>
  <li>If you see 'Vision Disabled' on a token in your list, it means the GM has not enabled vision for that token.
  </br>
  <li>GM-Owned tokens with vision share their vision with all players..
</div>`,w=`
    <div id="newsContainer">
        <h1>Smoke & Spectre! 6/9</h1>
        Medium update!  I wanted to add some more leverage to NOT using Auto-Detect maps, so now it's default functionality will be to ONLY fog the area within it's borders.
        </br> So if you ever wanted to fog only a portion of the map and have the rest visible, this is the way to do it. Simply turn off Auto-Detect and use the Boundary Box.
        </br>
        </br> Also, it exists in the FOG layer now. So to manually move the box by clicking/dragging, you'll need to go to the Fog Tools.
        <h1>Smoke & Spectre! 6/7-B</h1>
        Biscuits.
        </br> I'll get a Readme up for this soon, as the Elevation aspect of things could use some hard documentation.
        </br> Especially since some things were a -little- off and now hard rules have to be set.
        </br> Elevation-0; The base layer everything is at when you aren't using Elevation at all (and have not changed the default layer) will act like normal. You can't see past a wall if the Token is on 0, and the Wall is on 0.
        </br>
        </br> For Elevation; Any non-0 layer will behave differently. If the token is on the same layer as the wall, it WILL be able to see over it. The main reason for this is to make it easier to draw elevation - this allows you to continue as it was before, with drawing the mapping AROUND the obstructions.
        </br> Having it the other way around would mean you would need to draw it within the shape, and that gets very confusing once you have close buildings.
        </br>
        </br> This change shoudln't effect very many of you. But for those it does, it should still be behaving as it was before. Except any lines on Elevation-0 have 'infinite' height. They basically can't be seen over.  If you need to get around this, just cover the entire map in Layer-1.
        </br> Sorry for the confusion.
        </br>
        <h1>Smoke & Spectre! 6/7</h1>
        Fixed a bug with Elevation when being used on a scene that never set the default elevation layer.
        </br> And.. probably some other little ones. Probably.
        <h1>Smoke & Spectre! 5/28-B</h1>
        Realized the tools were never loading their settings, despite being saved. Fixed. (Tool Width/Color/etc)
        Added in a Default Elevation Mapping setting. Previously, the base layer was always assigned a 0. Which is fine for outdoor maps going up, but not necessarily default maps going down.
        </br> What this would do is allow you to set what the 'default' mapping layer would be for all un-assigned lines.  So if you want everything to start higher and build your way down into a pit, you would set this to 6 and go about your business.
        <h1>Smoke & Spectre! 5/28</h1>
        Small patch to hopefully address an issue where some people have seen fog worker errors.
        </br> Not sure on the cause though, as it could be anything from imported maps to weird scenes - but this should just log the error and keep it moving.
        </br>
        <h1>Smoke & Spectre! 5/20</h1>
        I really need to do something else.
        </br> Major update today:
        Elevation v1.0
        </br></br> <div style="text-align:center;">GM View</div>
        </br><img class="news-image" src="https://battle-system.com/owlbear/smoke-docs/elevation-gm.png">
        </br>
        </br> <div style="text-align:center;">Player View</div>
        </br><img class="news-image" src="https://battle-system.com/owlbear/smoke-docs/elevation-player.gif">
        </br>
        Since this is a first-pass, I've limited things to keep it simple.
        </br> There are only 5 layers of elevation to mess with.
        </br> A wall's elevation is determined by where it's STARTING POINT is. (Just in case you have things super close together.)
        </br> If you have several elevation mappings stacked, whichever one is highest at the point of the token/wall takes priority.
        </br> Other than that, it should be fairly straight forward.  Turn on the Elevation Mapping editor, make some shapes. It saves after each shape is completed, or when you De-Activate the editor.
        </br> So you can leave the editor active, manipulate the shapes with the OBR tools and then de-activate the editor to save your work.
        </br>
        </br> Some other QoL improvements - added portals/doors to the scene import.
        </br> Added an 'Undo' button to the obstruction drawing tools. It'll just pop off the last point you did. The hotkey for it is 'Z'. (Not CTRL-Z because that's OBR's undo.)
        </br> Other-random-things I can't remember.
        </br> Enjoy!
        </br>
        <h1>Smoke & Spectre! 5/20</h1>
        Minor fix for the 'DPI AutoDetect' checkbox not working.
        </br> And some improvements to make unlocking/locking large amounts of fog process.
        </br> Also some extra busy-detection on the importers.
        </br>
        <h1>Smoke & Spectre! 5/18</h1>
        Good ole release hiccups.
        </br> Pushing out some stability and bugfixes.
        </br> More pruning on old code to have -less- updates go through for processing fog.  It does feel a little faster, again.
        </br> The Spectre code had some issues and the storage for that was changed around, and less debounce so it should be snappier.
        </br> And a variety of bugfixes for swapping scenes.
        </br> Let me know in Discord if things are still acting up (Though I'll be gone the rest of this night.)
        </br></br> And you know, be nice about it.
        <h1>Smoke & Spectre! 5/17</h1>
        This is the update you were dreading!
        </br> I moved everything.
        </br></br> In my effort to have proper documentation across all extensions, I needed to get this in a space where I wasn't going to facelift it anytime soon. So I needed to facelift it now.
        </br></br>Other large changes:
        <li> Smoke will now process your lines whether they are in-boundary or not, based on where they exitted. No more 'stuck' extension because you goofed.
        <li> The first 'click' of an obstruction tool will now snap to the grid, if you have snap enabled.
        <li> When using the obstruction tools, if you hold CTRL it will temporarily disable snap.
        <li> Cleaned up a filter that was allowing you to 'Enable Door' on any ole random line. (Oops.)
        <li> Added support for the OBR drawing tools, you can now use any of the default OBR drawing tools to create obstructions. You just need to 'Convert to Obstruction' on the line.
        <li> Added 'UVTT Scene' import option. This one will import entire scenes (the map, lights, walls).
        <li> Added 'Out-of-Sight' button for vision tokens, which will hide them. Because there's really no reason to see 20 lights at all times.
        <li> Some random bug fixes for swapping between scenes with different settings.
        </br></br> Also, I rewrote Spectre.
        <li> You can now 'Spectre' anything that is an Image based token.
        <li> Players can now move/change Spectre tokens. This incldues deleting. (This is all still controlled by your Permissions though.)
        <li> Updated the scene persistence for Spectre'd tokens.
        </br></br> Things seem pretty stable in my testing, though I have seen a tale of an issue with hot-loading on a scene 100+ times.. which is likely something that only I will run into.
        </br> So enjoy.

        <h1>Smoke & Spectre! 5/9</h1>
        This is the update you were hoping for!
        </br>
        </br> I rewrote the cache and processing. You should be seeing a major speed-up with processing (depending on your PC) - but times should at least be cut in half with a potato.
        </br> With a faster PC, about 90% of the processing time should be shaved off.
        </br>
        </br> There might be a few hiccups, but I spent this week writing, re-writing and testing this one so it feels pretty solid. Please give me a ping if you notice something.
        </br> And if you use this extension a lot, be sure to check the Patreon to show some support (Kind works help, too!)
        </br>
        <h1>Smoke & Spectre! 5/3</h1>
        Minor update, fixed an issue where Persistence was being reset if the scene metadata was changed by a different extension.
        </br> Also made a few tweaks to squeeze out the fog about 15% faster.
        <h1>Smoke & Spectre! 4/25</h1>
        Minor hiccups with the scene not loading before the extension did. Should be resolved. </br>
        <h1>Smoke & Spectre! 4/24</h1>
        'Major' fixes today.
        </br></br> The 'Performance' option was removed. Accurate was no longer needed, and was causing a lot of issues for people who left it on - as the amount of fog shapes that built up over a few hours would bog down processing.
        </br> Unlock/Lock All (obstruction) Line buttons were added. Nice and fast way to lock down the map, or open up for editing.
        </br> Obstruction Lines are now locked by default.  Why weren't they like this before? I don't know.
        </br> GM tokens in the list are now colored like a player's token is, to remove ambiguity of owner. (Though if two people are the same color, that's on you.)
        </br> Added help text on mouse-over to the tokens on the GM list to specify owner further.
        </br></br> User Data is now cached to the scene - what this means for Smoke is that it'll process correctly when people are not there.
        </br> - So if your GM isn't there, but there are GM tokens that should give sight - those should work.
        </br> - Or if you're the GM, the tokens should retain their ownership color.
        </br> This is mostly QoL stuff, but needed nonetheless.  After I circle back on some other things I'll see what can be done on processing speed.
        </br></br> Enjoy.
        <h1>Smoke & Spectre! 4/11</h1>
        Minor bugfix.
        </br> Addressed the lag when clicking to place a point when drawing obstructions.
        </br> As always, I don't mind the feedback - but realize this is something released for free, that I work on in my free time. Try not to come off as an entitled twerp when doing so. It's appreciated.
        </br>
    </div>
`;n.onReady(async()=>{const s=window.location.search,t=new URLSearchParams(s),i=t.get("gethelp"),o=t.get("subscriber")==="true";c.innerHTML=i?p:w,b.innerHTML=`
    <div id="footButtonContainer">
        <button id="discordButton" type="button" title="Join the Owlbear-Rodeo Discord"><embed class="svg discord" src="/w-discord.svg" /></button>
        <button id="patreonButton" type="button" ${o?'title="Thank you for subscribing!"':'title="Check out the Battle-System Patreon"'}>
        ${o?'<embed id="patreonLogo" class="svg thankyou" src="/w-thankyou.svg" />':'<embed id="patreonLogo" class="svg patreon" src="/w-patreon.png" />'}</button>
        <button id="basicTutorial" type="button" title="Go to the Basic Tutorial, created by the OBR Community Manager Andrew.">Basic</br>Tutorial</button>
        <button id="advTutorial" type="button" title="Go to the Basic Tutorial, created by the OBR Community Manager Andrew.">Advanced</br>Tutorial</button>
    </div>
    <button id="closeButton" type="button" title="Close this window"><embed class="svg close" src="/w-close.svg" /></button>
    `;const a=document.getElementById("closeButton");a.onclick=async()=>{await n.modal.close(u.EXTENSIONWHATSNEW)};const r=document.getElementById("patreonButton");r.onclick=async e=>{e.preventDefault(),window.open("https://www.patreon.com/battlesystem","_blank")};const l=document.getElementById("discordButton");l.onclick=async e=>{e.preventDefault(),window.open("https://discord.gg/ANZKDmWzr6","_blank")};const h=document.getElementById("basicTutorial");h.onclick=async e=>{e.preventDefault(),window.open("https://www.reddit.com/r/OwlbearRodeo/s/OHvSwEEQCw","_blank")};const d=document.getElementById("advTutorial");d.onclick=async e=>{e.preventDefault(),window.open("https://www.reddit.com/r/OwlbearRodeo/s/U19IoydcHP","_blank")}});
