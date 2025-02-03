---
title: Linux Kernel Linked List
author: nowpassion
date: 2025-01-13
category: Jekyll
layout: post
mermaid: true
---
## 기본 구조
* Linux Kernel의 Linked List 데이터 형은 아래와 같음. (include/linux/list.h)
  * 단순히 연결여부만 확인이 가능함.

  ```c
  struct list_head {
	struct list_head *next, *prev;
  };
  ```
  * Linked List로 연결할 데이터 내에 struct list_head를 선언하여 이를 연결한다.
  <br />
  <img src="/assets/dll.png" width="400">
  
  * next는 다음 next를 가리키며, prev는 이전의 next를 가리킨다.(next는 Linked List의 첫 포인터 주소이기 때문이다.)
* 그래서 이를 사용하기 위해서는 아래와 같이 선언하여 사용함. (skbuff.h 의 일부)
  * sk_buff 구조체는 list_head list가 선언되어 있어 연결 리스트로 구성되어 있을 수 있음을 아래 코드에서 확인할 수 있음.
  
  ```c
  struct sk_buff {
    union {
		struct {
			/* These two members must be first. */
			struct sk_buff		*next;
			struct sk_buff		*prev;

			union {
				struct net_device	*dev;
				/* Some protocols might use this space to store information,
				 * while device pointer would be NULL.
				 * UDP receive path is one user.
				 */
				unsigned long		dev_scratch;
			};
		};
		struct rb_node		rbnode; /* used in netem, ip4 defrag, and tcp stack */
		struct list_head	list;
	};
    ... 
  }
  ```
<br />

## offsetof와 contain_of
* 그럼 linked_list만을 가지고 어떻게 실제 연결 리스트에 포함된 데이터를 알 수 있을까?
  * 이를 위해 사용하는 매크로가 바로 offsetof / container_of 이다.
  * offsetof는 0으로 부터의 해당 멤버의 포인터 값를 계산한다.

  ```c
  #undef offsetof
  #ifdef __compiler_offsetof
  #define offsetof(TYPE, MEMBER)	__compiler_offsetof(TYPE, MEMBER)
  #else
  #define offsetof(TYPE, MEMBER)	((size_t)&((TYPE *)0)->MEMBER)
  #endif
  ```
  * container_of는 offsetof를 이용하여 member를 포함한 struct type가 선언된 주소를 얻어온다.
    * 멤버의 list_head의 next포인터에서 Struct A의 next 포인터 offset 만큼 빼면 list_head를 가지고 있는 Struct A타입의 첫 주소를 얻어낼 수 있다. (아래 그림의 붉은 색 부분)
    <br />
    <img src="/assets/dll.png" width="400">


  ```c
  /** 
   * XXX
   * type에 해당되는 struct의 memeber offset을 mptr에서 뺌으로써 
   * mptr을 가지고 있는 struct의 첫 주소를 얻어낼 수 있다.
   * 이는 mptr과 type의 member가 같은 형태를 가지고 있다는 전제가 있기에 가능한 것이다
   */

  /**
   * container_of - cast a member of a structure out to the containing structure
   * @ptr:	the pointer to the member.
   * @type:	the type of the container struct this is embedded in.
   * @member:	the name of the member within the struct.
   *
   */
  #define container_of(ptr, type, member) ({				\
    void *__mptr = (void *)(ptr);					\
	BUILD_BUG_ON_MSG(!__same_type(*(ptr), ((type *)0)->member) &&	\
			 !__same_type(*(ptr), void),			\
			 "pointer type mismatch in container_of()");	\
	((type *)(__mptr - offsetof(type, member))); })	

  ```
  * 아래 코드를 설명해 보자면, 함수 argument로 받아온 lock을 가지고 있는 struct ww_mutex 메모리가 존재하는 지 확인하는 코드이다. (include/linux/ww_mutex.h, kernel/locking/mutex.c 참고)

  ```c
  struct ww_mutex {
  	struct mutex base;
  	struct ww_acquire_ctx *ctx;
  #ifdef CONFIG_DEBUG_MUTEXES
  	struct ww_class *ww_class;
  #endif
  };

  static inline int 
  __sched __ww_mutex_check_kill(struct mutex *lock, struct mutex_waiter *waiter,
  							 struct ww_acquire_ctx *ctx)
  {
  	// XXX
  	// lock과 base의 형이 같기 때문에 struct mutex크기를 가지고 있는 lock 에서
  	// ww_mutex.base 주소 (struct mutex) 만큼을 빼면 ww_mutex의 첫 주소가 계산될 것임.
  	struct ww_mutex *ww = container_of(lock, struct ww_mutex, base);
  	...
  }
  ```
