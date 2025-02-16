#!/bin/sh

# 프로그램 이름
PROGRAM_NAME="jekyll"

# 프로그램이 실행 중인지 확인하는 함수
is_running() {
    pgrep -f "$PROGRAM_NAME" > /dev/null 2>&1
    return $?
}

# 프로그램 실행 함수
start_program() {
    if is_running; then
        echo "프로그램이 이미 실행 중입니다."
    else
		$PROGRAM_NAME serve -t --watch -H 192.168.174.10 -b "" -B
		if [ $? -eq 0 ];
		then
        	echo "프로그램을 시작합니다."
		else
			echo "프로그램을 시작하는데 실패했습니다."
		fi
    fi
}

# 프로그램 종료 함수
stop_program() {
    if is_running; then
        pkill -f "$PROGRAM_NAME"
        echo "프로그램을 종료합니다."
    else
        echo "실행 중인 프로그램이 없습니다."
    fi
}

# 명령어 인수 처리
if [ $# -eq 0 ]; then
    start_program
else
    case $1 in
        start)
            start_program
            ;;
        stop)
            stop_program
            ;;
        *)
            echo "사용법: $0 [start|stop]"
            ;;
    esac
fi

