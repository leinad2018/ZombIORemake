:: Set working directory to this folder
pushd "%~dp0"

set PROJECT_DIR=../
set OUT_DIR=../output/
set SERVICE=%1

call tsc -p %PROJECT_DIR%services/%SERVICE%/tsconfig.json
call echo D | xcopy /E /Y "%PROJECT_DIR%services/%SERVICE%/assets" "%OUT_DIR%services/%SERVICE%/assets"
call echo D | xcopy /E /Y "%PROJECT_DIR%services/%SERVICE%/lib" "%OUT_DIR%services/%SERVICE%/lib"
call echo D | xcopy /E /Y "%PROJECT_DIR%services/%SERVICE%/web" "%OUT_DIR%services/%SERVICE%/web"