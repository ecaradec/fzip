(function() {
    function dump(arr,level) {
        var dumped_text = "";
        if(!level) level = 0;
        
        //The padding given at the beginning of the line.
        var level_padding = "";
        for(var j=0;j<level+1;j++) level_padding += "    ";
        
        if(typeof(arr) == 'object') { //Array/Hashes/Objects 
            for(var item in arr) {
                var value = arr[item];
                
                if(typeof(value) == 'object') { //If it is an array,
                    dumped_text += level_padding + "'" + item + "' ...\n";
                    dumped_text += dump(value,level+1);
                } else {
                    dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
                }
            }
        } else { //Stings/Chars/Numbers etc.
            dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
        }
        return dumped_text;
    }

    function p(txt) {
        WScript.Echo(txt);
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
    function parseExpr() {
        r.push(scan(/^fssc \+(.*?) /,0,1));
        r.push([]);
        r[1].push(scan(filerx,1,1));
        while(scan(/^;/,0,0,true)) {
            r[1].push(scan(filerx,1,1))
        }
        r.push(scan(/^ to /,0,0));
        r.push(scan(filerx,1,1));
        return r;
    }

    var r;
    var q;
    var index;
    //var r=[];
    //var q="fssc +zip c:\\toto;c:\\tutu to c:\\tata";
    //var index=0;
    //try {
    //    parseExpr();
    //} catch(e) { p("partial match"); }


    plugins["zip"]={
        version:"v1.0.0",
        lastChange:"Nov 13st 2008",
        displayName:"Zipper",
        directory:currentDirectory,
        icon:currentDirectory+"\\zipper.ico",
        //autocomplete:"colors", // replace the default completion : you need to define an alias file to use it
        search:function(querykey, explicit, queryraw, querynokeyword, modifier, triggermethod) {
            if(!explicit) return;        

            r=[];
            q=queryraw;
            index=0;

            try {
                parseExpr();
            } catch(e) { /*p("partial match");*/ }

            displayBalloonMessage(dump(r));

            if(r.length==2 && r[0]=="zip") {
                //displayBalloonMessage(dump(r));
                doDeferedSearch(r[1][0])
            }

            /*var q=queryraw;
            var p=Math.max(q.lastIndexOf(";"), q.lastIndexOf("fssc +zip ")+9);

            if(p!=-1) {
                displayBalloonMessage(queryraw.substring(p+1));
                var z=queryraw.substring(p+1)
                if(z!="")
                    doDeferedSearch(z);
            }else {
                setRichEditMode("fssc +zip <File>;<File>;<File> to <TargetFile>");
            }*/
        },
        trigger:function(path, title, groupname, pluginid, thispluginid, score, entrytype, args) {
            if(path.indexOf("dosearch")==0)
                return;

            /*if(FARR.getQueryString().indexOf("fssc +zip")!=0 || entrytype!=FILE && entrytype!=FOLDER)
                return;
            
            var q=FARR.getQueryString();

            var p=Math.max(q.lastIndexOf(";"), q.lastIndexOf("fssc +zip ")+9);
            var z=q.substring(0, p+1);
            if(z!="")
                FARR.setStrValue("setsearchnogo",z+path);*/
            
            //return HANDLED;
        },
        showSettings:function() {
            //FARR.debug("showSettings");
            //FARR.exec(this.directory+"\\colorsSettings.ahk");
        }
    }
})();
