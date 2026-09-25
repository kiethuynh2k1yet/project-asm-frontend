"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  RegisterText,
  RememberLabel,
  Subtitle,
  Title,
  VisualContent,
  VisualDescription,
  VisualPanel,
  VisualTitle,
} from "./login-form.styles";
import { loginService } from "../../services/auth.service";

export default function LoginForm() {
  const router = useRouter();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");

    if (!usernameOrEmail.trim()) {
      setMessage("Vui lòng nhập username hoặc email.");
      return;
    }

    if (!password) {
      setMessage("Vui lòng nhập mật khẩu.");
      return;
    }

    try {
      setIsLoading(true);

      const data = await loginService({
        login: usernameOrEmail.trim(),
        password,
      });

      console.log("Login success:", data);

      // Nếu backend trả accessToken nhưng chưa dùng cookie:
      // localStorage.setItem("accessToken", data.accessToken || "");

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Đăng nhập thất bại.";

      setMessage(message);
    } finally {
      setIsLoading(false);
    }
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
              <Label htmlFor="usernameOrEmail">Tên đăng nhập hoặc email</Label>

              <Input
                id="usernameOrEmail"
                name="usernameOrEmail"
                type="text"
                placeholder="Nhập username hoặc example@gmail.com"
                value={usernameOrEmail}
                onChange={(event) => setUsernameOrEmail(event.target.value)}
                autoComplete="username"
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </FormGroup>

            <FormOptions>
              <RememberLabel>
                <Checkbox
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  disabled={isLoading}
                />

                <span>Ghi nhớ đăng nhập</span>
              </RememberLabel>

              <ForgotPassword href="/forgot-password">
                Quên mật khẩu?
              </ForgotPassword>
            </FormOptions>

            {message && <Message>{message}</Message>}

            <LoginButton type="submit" disabled={isLoading}>
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </LoginButton>
          </LoginFormWrapper>

          <RegisterText>Hãy liên hệ quản trị viên để có thể đăng nhập</RegisterText>
        </FormPanel>
      </LoginLayout>
    </PageWrapper>
  );
}