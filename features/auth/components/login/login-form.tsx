"use client";

import { useState } from "react";
import {
  Checkbox,
  FloatingCircle,
  FloatingCircleSmall,
  ForgotPassword,
  FormGroup,
  FormOptions,
  FormPanel,
  Header,
  Input,
  Label,
  LoginButton,
  LoginFormWrapper,
  LoginLayout,
  Message,
  MockupBar,
  MockupCard,
  MockupChart,
  MockupChartBar,
  MockupContent,
  MockupHeader,
  MockupItem,
  MockupItems,
  MockupLogo,
  MockupTitle,
  PageWrapper,
  RegisterLink,
  RegisterText,
  RememberLabel,
  Subtitle,
  Title,
  VisualContent,
  VisualDescription,
  VisualPanel,
  VisualTitle,
} from "./login-form.styles";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() && !password.trim()) {
      setMessage('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    if (!email.trim()) {
      setMessage('Vui lòng nhập email.');
      return;
    }

    if (!password.trim()) {
      setMessage('Vui lòng nhập mật khẩu.');
      return;
    }

    // Gọi API đăng nhập khi đã có backend
    console.log({
      email,
      password,
      remember,
    });

    setMessage('Đăng nhập thành công (demo).');
    };

  return (
    <PageWrapper>
      <LoginLayout>
        <VisualPanel>
          <FloatingCircle />
          <FloatingCircleSmall />

          <VisualContent>
            <VisualTitle>
              Quản lý công việc
              <br />
              đơn giản hơn.
            </VisualTitle>

            <VisualDescription>
              Đăng nhập để theo dõi tiến độ, quản lý dự án và làm việc hiệu quả
              hơn mỗi ngày.
            </VisualDescription>

            <MockupCard>
              <MockupHeader>
                <MockupLogo>KT</MockupLogo>
                <MockupTitle>Dashboard</MockupTitle>
                <MockupBar />
              </MockupHeader>

              <MockupContent>
                <MockupChart>
                  <MockupChartBar $height="45%" />
                  <MockupChartBar $height="70%" />
                  <MockupChartBar $height="55%" />
                  <MockupChartBar $height="90%" />
                  <MockupChartBar $height="75%" />
                </MockupChart>

                <MockupItems>
                  <MockupItem />
                  <MockupItem />
                  <MockupItem />
                </MockupItems>
              </MockupContent>
            </MockupCard>
          </VisualContent>
        </VisualPanel>

        <FormPanel>

          <Header>
            <Title>Đăng nhập</Title>
            <Subtitle>
              Nhập thông tin tài khoản để tiếp tục sử dụng hệ thống.
            </Subtitle>
          </Header>

          <LoginFormWrapper onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="password">Mật khẩu</Label>

              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </FormGroup>

            <FormOptions>
              <RememberLabel>
                <Checkbox
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                <span>Ghi nhớ đăng nhập</span>
              </RememberLabel>

              <ForgotPassword href="/forgot-password">
                Quên mật khẩu?
              </ForgotPassword>
            </FormOptions>

            {message && <Message>{message}</Message>}

            <LoginButton type="submit">Đăng nhập</LoginButton>
          </LoginFormWrapper>

          <RegisterText>
            Bạn chưa có tài khoản?{" "}
            <RegisterLink href="/register">Đăng ký ngay</RegisterLink>
          </RegisterText>
        </FormPanel>
      </LoginLayout>
    </PageWrapper>
  );
}
