"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Card,
  Description,
  ErrorMessage,
  Footer,
  Form,
  FormGroup,
  Heading,
  IconWrapper,
  Input,
  Label,
  PageWrapper,
  PrimaryButton,
  SuccessContent,
  SuccessIcon,
  Title,
} from "./ForgotPassword.styles";

export default function ForgotPassword() {
  const [login, setLogin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!login.trim()) {
      setError("Vui lòng nhập username hoặc email đăng nhập.");
      return;
    }

    if (!newPassword) {
      setError("Vui lòng nhập mật khẩu mới.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    if (!confirmPassword) {
      setError("Vui lòng nhập lại mật khẩu mới.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: login.trim(),
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data.message)
          ? data.message[0]
          : data.message;

        throw new Error(
          message ?? "Đặt lại mật khẩu thất bại. Vui lòng thử lại.",
        );
      }

      setIsSuccess(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Đặt lại mật khẩu thất bại. Vui lòng thử lại.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <PageWrapper>
        <Card>
          <SuccessContent>
            <SuccessIcon>✓</SuccessIcon>

            <Title>Đặt lại mật khẩu thành công</Title>

            <Description>
              Mật khẩu của tài khoản <strong>{login}</strong> đã được cập nhật.
              Bạn có thể đăng nhập bằng mật khẩu mới.
            </Description>

            <PrimaryButton as={Link} href="/login">
              Đi đến trang đăng nhập
            </PrimaryButton>
          </SuccessContent>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Card>
        <IconWrapper aria-hidden="true">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </IconWrapper>

        <Heading>
          <Title>Quên mật khẩu</Title>

          <Description>
            Nhập username hoặc email và mật khẩu mới của bạn.
          </Description>
        </Heading>

        <Form onSubmit={handleSubmit} noValidate>
          <FormGroup>
            <Label htmlFor="login">Username hoặc email đăng nhập</Label>

            <Input
              id="login"
              name="login"
              type="text"
              placeholder="Nhập username hoặc email"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              autoComplete="username"
              aria-invalid={Boolean(error)}
              disabled={isLoading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="newPassword">Mật khẩu mới</Label>

            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              aria-invalid={Boolean(error)}
              disabled={isLoading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="confirmPassword">Nhập lại mật khẩu mới</Label>

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              aria-invalid={Boolean(error)}
              disabled={isLoading}
            />
          </FormGroup>

          {error && <ErrorMessage role="alert">{error}</ErrorMessage>}

          <PrimaryButton type="submit" disabled={isLoading}>
            {isLoading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
          </PrimaryButton>
        </Form>

        <Footer>
          <Link href="/login">← Quay lại đăng nhập</Link>
        </Footer>
      </Card>
    </PageWrapper>
  );
}
