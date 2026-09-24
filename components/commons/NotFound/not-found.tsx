"use client";

import { useRouter } from "next/navigation";
import * as S from "./not-found.styles";

const NotFound = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <S.Container>
      <S.BackgroundCircle />

      <S.Content>
        <S.ErrorCode>404</S.ErrorCode>

        <S.Title>Không tìm thấy trang</S.Title>

        <S.Description>
          Có thể đường dẫn bạn truy cập không tồn tại, đã bị thay đổi hoặc
          hiện không còn khả dụng.
        </S.Description>

        <S.Actions>
          <S.HomeButton href="/">Về trang chủ</S.HomeButton>

          <S.BackButton type="button" onClick={handleGoBack}>
            Quay lại trang trước
          </S.BackButton>
        </S.Actions>

        <S.Status>
          ERROR: PAGE_NOT_FOUND
          <S.Cursor>_</S.Cursor>
        </S.Status>
      </S.Content>
    </S.Container>
  );
};

export default NotFound;