:: Set working directory to this folder
pushd "%~dp0"

set PROJECT_DIR=../
set OUT_DIR=../output/

:: Compile server code & silently copy dependencies
call tsc -p %PROJECT_DIR%server/tsconfig.json
call echo D | xcopy /E /Y /Q "%PROJECT_DIR%server/node_modules" "%OUT_DIR%server/node_modules"

:: Load shared code
call echo D | xcopy /E /Y "%PROJECT_DIR%common/assets" "%OUT_DIR%common/assets"
call echo D | xcopy /E /Y "%PROJECT_DIR%common/lib" "%OUT_DIR%common/lib"