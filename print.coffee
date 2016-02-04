ejs = require "ejs"
fs = require "fs"
recursive = require "recursive-readdir"
path = require "path"

tmpl_raw = fs.readFileSync "print.tex.ejs", "utf-8"
tmpl = ejs.compile tmpl_raw

doTest = (testName) ->
	recursive "tests/"+testName, (err, files) ->
		langMap =
			".html": "html"
			".csv": "text"
			".scss": "scss"
			".js": "javascript"
			".json": "json"

		res = for file in files
			path: file
			name: file.replace /_/g, '\\_'
			lang: langMap[path.extname file]

		obj =
			res: res
			title: testName

		console.log res

		fs.writeFileSync testName+".tex", tmpl files: obj

doTest("layout")
doTest("3d")
