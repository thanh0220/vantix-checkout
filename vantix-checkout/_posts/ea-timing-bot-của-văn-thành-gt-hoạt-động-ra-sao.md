---
title: EA Timing Bot của Văn Thành GT hoạt động ra sao?
description: EA Timing là phần mềm giao dịch tự động chạy trên MetaTrader 5,
  được Văn Thành GT lập trình dựa trên hệ thống phân tích kết hợp cấu trúc nến
  H4 + RSI xác nhận. EA thay thế việc phải ngồi canh chart thủ công — nó tự
  quét, tự phát hiện tín hiệu, và tự vào lệnh theo đúng quy trình bạn đã học.
excerpt: EA Timing là phần mềm giao dịch tự động chạy trên MetaTrader 5, được
  Văn Thành GT lập trình dựa trên hệ thống phân tích kết hợp cấu trúc nến H4 +
  RSI xác nhận.
tag: Price Action
date: 2026-05-22
read_time: 5 phút
---
EA Timing là phần mềm giao dịch tự động chạy trên MetaTrader 5, được Văn Thành GT lập trình dựa trên hệ thống phân tích kết hợp cấu trúc nến H4 + RSI xác nhận. EA thay thế việc phải ngồi canh chart thủ công — nó tự quét, tự phát hiện tín hiệu, và tự vào lệnh theo đúng quy trình bạn đã học.

Khung thời gian nền

H4

RSI xác nhận

M5 / M15 / H1

Phiên bản

v1.11

Bước 1 — Quét và vẽ Timing Line

1

EA quét 50 nến H4 gần nhất

Mỗi khi nến H4 mới đóng, EA tự động phân tích cặp nến và nhận diện 5 loại mẫu hình cấu trúc quan trọng, vẽ đường Timing Line lên biểu đồ.

Gap SNR

Hidden Base — vùng giá bị bỏ qua tạo ra gap giữa 2 nến tăng/giảm liên tiếp

Outside Bar (OSB)

Nến bao ngoài hoàn toàn nến trước — vẽ line tại High và Low của nến bị bao

Inside Bar (ISB)

Nến nằm gọn trong nến mẹ — vẽ line tại High/Low của nến mẹ, cần RSI xác nhận 2 pha

Engulfing (ENG)

Nến nhấn chìm hoàn toàn — bearish engulfing → line kháng cự; bullish engulfing → line hỗ trợ

No Supply / No Demand

Nến không có áp lực — No Supply (nến giảm yếu sau nến tăng mạnh) → line mua; No Demand (ngược lại) → line bán

Bước 2 — Chờ giá chạm line (điều kiện kích hoạt)

2

Wick chạm line, close vẫn đúng phía

EA theo dõi từng nến M5/M15/H1. Khi wick (bóng nến) chạm vào đường Timing Line nhưng close vẫn nằm đúng phía (dưới kháng cự hoặc trên hỗ trợ), EA bắt đầu quy trình xác nhận tín hiệu. Nếu close xuyên thẳng qua — bỏ qua, tín hiệu không hợp lệ.

Bước 3 — Xác nhận tín hiệu (2 chế độ)

ISB — Xác nhận 2 pha

P1

Chờ RSI (M5/M15/H1) chạm vùng Overbought ≥ 70 (sell) hoặc Oversold ≤ 30 (buy). Timeout sau tối đa 20 nến.

P2

RSI đã xác nhận → đếm 4 nến liên tiếp. Nến thứ 4 close đúng phía → vào lệnh.

Gap / OSB / ENG / NoSD — 1 pha

→

Không cần RSI. Wick chạm line là bắt đầu đếm ngay 4 nến. Nến thứ 4 close đúng chiều → vào lệnh. Đơn giản, nhanh hơn.

Bước 4 — Vào lệnh & quản lý vốn tự động

4

Mở 2 lệnh cùng lúc: TP1 + TP2

Mỗi tín hiệu EA mở 2 lệnh với cùng điểm vào, cùng SL — nhưng 2 mức chốt lời khác nhau. Lot size tự tính dựa theo % rủi ro tài khoản, chia đều cho 2 lệnh.

Stop Loss (SL)

Đặt tại High/Low cực đoan của 4 nến đã đếm + buffer 2 pips. Hạn chế tối đa bị quét SL.

TP1 — 5R

Chốt lời tại mức 5 lần rủi ro. Khi TP1 đóng → tự động dời SL lệnh TP2 về Breakeven.

TP2 — 10R

Lệnh thứ 2 chạy dài đến 10R, với SL đã được bảo vệ tại điểm hòa vốn sau TP1.

Risk tự động

Mặc định 1.5% tài khoản/lệnh. Lot size tự tính, không cần chỉnh tay mỗi lần vào lệnh.

Tính năng bảo vệ thông minh

Tự xóa line sau khi SL 2 lần

Nếu 1 đường Timing Line khiến tài khoản SL đủ 2 lần (có thể chỉnh), EA tự động xóa đường đó — không để bạn bị lỗ thêm tại cùng 1 vùng giá đã thất bại.

Lọc giờ giao dịch

Tự động dừng sau 21:00 thứ Sáu và ngoài khung 22:00–01:00 (giờ đêm). Tránh các phiên ít thanh khoản, spread cao.
