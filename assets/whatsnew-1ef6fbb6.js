import{O as n,C as u}from"./constants-0bc65094.js";/* empty css                  */const h=document.querySelector("#bs-whatsnew"),b=document.querySelector("#bs-whatsnew-notes"),w=`
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
</div>`,p=`
    <div id="newsContainer">
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
`;n.onReady(async()=>{const s=window.location.search,t=new URLSearchParams(s),r=t.get("gethelp"),o=t.get("subscriber")==="true";h.innerHTML=r?w:p,b.innerHTML=`
    <div id="footButtonContainer">
        <button id="discordButton" type="button" title="Join the Owlbear-Rodeo Discord"><embed class="svg discord" src="/w-discord.svg" /></button>
        <button id="patreonButton" type="button" ${o?'title="Thank you for subscribing!"':'title="Check out the Battle-System Patreon"'}>
        ${o?'<embed id="patreonLogo" class="svg thankyou" src="/w-thankyou.svg" />':'<embed id="patreonLogo" class="svg patreon" src="/w-patreon.png" />'}</button>
        <button id="basicTutorial" type="button" title="Go to the Basic Tutorial, created by the OBR Community Manager Andrew.">Basic</br>Tutorial</button>
        <button id="advTutorial" type="button" title="Go to the Basic Tutorial, created by the OBR Community Manager Andrew.">Advanced</br>Tutorial</button>
    </div>
    <button id="closeButton" type="button" title="Close this window"><embed class="svg close" src="/w-close.svg" /></button>
    `;const i=document.getElementById("closeButton");i.onclick=async()=>{await n.modal.close(u.EXTENSIONWHATSNEW)};const a=document.getElementById("patreonButton");a.onclick=async e=>{e.preventDefault(),window.open("https://www.patreon.com/battlesystem","_blank")};const c=document.getElementById("discordButton");c.onclick=async e=>{e.preventDefault(),window.open("https://discord.gg/ANZKDmWzr6","_blank")};const d=document.getElementById("basicTutorial");d.onclick=async e=>{e.preventDefault(),window.open("https://www.reddit.com/r/OwlbearRodeo/s/OHvSwEEQCw","_blank")};const l=document.getElementById("advTutorial");l.onclick=async e=>{e.preventDefault(),window.open("https://www.reddit.com/r/OwlbearRodeo/s/U19IoydcHP","_blank")}});
