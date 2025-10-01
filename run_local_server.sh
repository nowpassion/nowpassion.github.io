#!/bin/sh

# 프로그램 이름
PROGRAM_NAME="jekyll"
my_ipaddr=""

find_my_ipaddr()
{
	my_ipaddr=`ip -o -4 addr show dev enp3s0 | awk '{print $4}' | cut -d/ -f1`
}

# 프로그램이 실행 중인지 확인하는 함수
is_running() {
    pgrep -f "$PROGRAM_NAME" > /dev/null 2>&1
    return $?
}

# 프로그램 실행 함수
start_program() {
    daemon_option="$1"

    if is_running; then
        echo "프로그램이 이미 실행 중입니다."
    else
		$PROGRAM_NAME serve -w -t -H "$my_ipaddr" -b "" $daemon_option
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

find_my_ipaddr

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
		restart)
            stop_program
			sleep 2
            start_program
            ;;
        start-daemon)
            start_program "-B"
            ;;
        restart-daemon)
            stop_program
			sleep 2
            start_program "-B"
            ;;
        *)
            echo "사용법: $0 [start|stop|restart|start-daemon|restart-daemon]"
            ;;
    esac
fi

