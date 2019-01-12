robocopy "./client/webpage" "./output" index.html
xcopy /y /exclude:copyClientExclude.txt "./client/webpage" "./output/static"