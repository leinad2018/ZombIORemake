:: Set working directory to this folder
pushd "%~dp0"

:: Construct the environment
call deleteOutput
call buildServer

:: Add services
call buildService client
call buildService console