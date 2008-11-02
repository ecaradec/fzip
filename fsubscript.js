(function() {
    function doDeferedSearch(txt) {    
        FARR.setInterval(0, 1,function() { 
            FARR.killInterval(0);
            FARR.setStrValue("stopsearch","");
            FARR.setStrValue("launch","dosearch "+txt);
            //displayBalloonMessage(txt);
        });
    }

    function scan(r,o,v,opt) {
        var m;
        if(m=q.substring(index).match(r)) {
        index+=m[o].length;
        return m[v];
        }
        if(opt!=true)
            throw "Error";
    }

    var filerx=/^([a-zA-Z]:.*?)(;|$| to )/
    function parseExpr(query) {
        r=[];
        q=query;
        index=0;

        try {            
            r.push({
                type:"alias",
                value:scan(/^(.+?) /,0,1),
                toString:function() { return this.value+" "; }
            });
            r.push({
                type:"filelist",
                value:[scan(filerx,1,1)],
                toString:function() { return this.value.join(""); }
            });

            while(scan(/^;/,0,0,true)) {
                r[1].value.push(";")
                r[1].value.push(scan(filerx,1,1))
            }
            r.push({
                type:"modifier",
                value:scan(/^ to /,0,0),
                toString:function() { return this.value; }
            });
            r.push({
                type:"file",
                value:scan(filerx,1,1),
                toString:function() { return this.value; }
            });
        } catch(e) {
            //displayBalloonMessage(e);
        }
        return r;
    }
    function toQuery() {
        var z="";
        for(var i=0;i<r.length;i++)
            z+=r[i].toString();

        return z;
    }
    function execSearch() {
        if(r.length==2 && r[0].type=="alias" && r[0].value=="zip" && r[1].type=="filelist")
            doDeferedSearch(r[1].value[r[1].value.length-1]);
        else if(r.length==4 && r[0].type=="alias" && r[0].value=="zip" && r[1].type=="filelist" && r[2].type=="modifier" && r[2].value==" to " && r[3].type=="file")
            doDeferedSearch(r[3].value+" +invoke");
    }
    function execComplete(path) {
        if(r.length==2 && r[0].type=="alias" && r[0].value=="zip" && r[1].type=="filelist") {
            r[1].value[r[1].value.length-1]=path;
            return toQuery();
        } else if(r.length==4 && r[0].type=="alias" && r[0].value=="zip" && r[1].type=="filelist" && r[2].type=="modifier" && r[2].value==" to " && r[3].type=="file") {
            r[3].value=path;
            return toQuery();
        }
    }
    function execInvoke(path) {
        var cmdLine="a \""+r[3].value+"\" -r ";//+r[1].value.join("\" ").replace(/;/g,"")+"\"";
        for(var i=0;i<r[1].value.length;i++) {
            if(r[1].value[i]==";")
                continue;
            if(r[1].value[i].match(/\\$/))
                cmdLine+=" \""+r[1].value[i]+"*.*\"";
            else
                cmdLine+=" \""+r[1].value[i]+"\"";
        }

        //displayBalloonMessage(cmdLine);
        FARR.exec(directory+"\\7z.exe", cmdLine, "");
    }

    var r;
    var q;
    var index;
    var directory=currentDirectory;

    plugins["FZip"]={
        aliasstr:"zip",
        version:"v0.2.0",
        lastChange:"Nov 30st 2008",
        displayName:"Zipper",
        directory:currentDirectory,
        icon:currentDirectory+"\\zipper.ico",
        //autocomplete:"colors", // replace the default completion : you need to define an alias file to use it
        search:function(querykey, explicit, queryraw, modifier, triggermethod) {
            if(queryraw.indexOf("+invoke")!=-1) {       
                var file=queryraw.replace("+invoke","")
                FARR.emitResult(querykey,FARR.getQueryString(), file, this.icon,UNKNOWN,IMMEDIATE_DISPLAY,2);
            }

            if(!explicit) return;

            FARR.setStrValue("ForceResultFilter", queryraw.substring(4));
            var r=parseExpr(queryraw.replace(/\//g,"\\"));
            execSearch(querykey);
        },
        trigger:function(path, title, groupname, pluginid, thispluginid, score, entrytype, args) {
            if(path.indexOf("dosearch")==0)
                return;

            var r=parseExpr(FARR.getQueryString());

            if(r.length==0 || r[0].type!="alias" || r[0].value!="zip")
                return;

            if(entrytype==FOLDER)
                path+="\\";

            restartSearch(execComplete(path));
            if(r.length==4)
                execInvoke(path);
            return HANDLED;
        },
        showSettings:function() {
            //FARR.debug("showSettings");
            //FARR.exec(this.directory+"\\colorsSettings.ahk");
        }
    }
})();
