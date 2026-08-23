Order Records
+-------+-----------------------------------------------------------------------------------------------------------------------------------------+
|		| Order Records																															  |
|		|																																		  |
|		| +-------------------------------------------------------------------------------------+	+-------------------------------------------+ |
|		| | Order history                                                            3 records  |	| Record new order							| |
|		| |-------------------------------------------------------------------------------------|	| Channel									| |
|		| | Order    		  Channel     Customer    		Total    Status             Actions |	| ( LINE )	( FACEBOOK )  ( STOREFRONT )	| |
|		| |-------------------------------------------------------------------------------------|	| [ Recipient Name ]						| |
|		| | #ORD-9021		  [LINE]	  Somchai Kittipong	฿5,900	 Awaiting payment	View    |	| [Phone Number ]							| |
|		| | 2026-08-20 13:42			  081-234-5678                                          |	| Shipping address (1)		  +Add address	| |
|		| |-------------------------------------------------------------------------------------|	| +---------------------------------------+	| |
|		| | #ORD-9020		  [FB]		  Nattapon Wongsa	฿2,290	 Paid				View    |	| | (🔵) address (1)  For shipping		  |	| |
|		| | 2026-08-20 11:18			  089-556-1140                                          |	| | House number	Street    Subdistrict |	| |
|		| |-------------------------------------------------------------------------------------|	| | [			]	[	]	  [			] |	| |
|		| | #ORD-9019		  [POS]		  Walk-in counter	฿680	 Completed			View    |	| | District		Province  Postal Code |	| |
|		| | 2026-08-20 10:55			  -                                                     |	| | [			]	[	]	  [			] |	| |
|		| |																						|	| +---------------------------------------+	| |
|		| |																						|	| Product List (1)				+ Add item	| |
|		| |																						|	| [Motul 7100 4T 10W-40    ^]    [1]    X	| |
|		| |																						|	| -----------------------------------------	| |
|		| |																						|	| Total								   ฿520	| |
|		| |																						|	| Payment									| |
|		| |																						|	| ( BANK TRANSFER )    ( CASH ON DELIVERY )	| |
|		| |																						|	| [✔️] Mark as already paid					| |
|		| |																						|	|        ( Save order & deduct stock )		| |
|		| +-------------------------------------------------------------------------------------+	+-------------------------------------------+ | 
+-------+-----------------------------------------------------------------------------------------------------------------------------------------+


#Order history
##Channel
Line = text-[#1f956a] bg-[#e0faec] rounded-xl
FB = text-[#276ed2] bg-[#e7f3ff] rounded-xl
POS = text-[#1d295b] bg-[#f1f5f9] rounded-xl

##Status
Awaiting payment = text-[#da8018] bg-[#fff3d7] rounded-xl
Paid = text-[#276ed2] bg-[#e7f3ff] rounded-xl
Completed = text-[#31976a] bg-[#e0faec] rounded-xl
Cancelled = text-[#e70029] bg-[#ffeded] rounded-xl

#Record new order
##Channel & Payment
Active = text-[#00b6d5] bg-[#e6f8fb] rounded-lg border-[#66d4e6]

Save order & deduct stock = text-white bg-[#07090c] rounded-lg