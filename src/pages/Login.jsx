import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../utils/apiRequest";
import { useCookies } from "react-cookie";
import { useDispatch } from "react-redux";
import { handleAuth, handleUser } from "../utils/reducers/reducer";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useTitle } from "../utils/useTitle";
import * as yup from "yup";
import Swal from "sweetalert2";
import girl from "../assets/girl.png";
import CustomInput from "../components/CustomInput";

const schema = yup.object().shape({
  email: yup.string().required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "password must be 8 characters")
    .max(30, "password must not exceed 30 characters")
    .matches(/^(?=.*[A-Z])/, "password must contain one uppercase")
    .matches(/^(?=.*[0-9])/, "password must contain one number")
    .matches(
      /^(?=.*[!@#\$%\^&\*])/,
      "password must contain one special character"
    ),
});

const Login = () => {
  useTitle("Mentutor");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies(["token"], ["role"]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (email && password) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [email, password]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onHandleLogin = async (data) => {
    setLoading(true);
    if (email.length == 0 || password.length == 0) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Data cannot be empty !",
        showConfirmButton: true,
      });
      return;
    }
    const body = {
      email,
      password,
    };
    apiRequest("login", "post", body)
      .then((res) => {
        const { data } = res.data;
        setCookie("token", res.data.token, { path: "/" });
        setCookie("role", res.data.role, { path: "/" });
        setCookie("id_user", res.data.id_user, { path: "/" });
        setCookie("images", res.data.images, { path: "/" });
        dispatch(handleAuth(true));
        dispatch(handleUser(res.data));

        if (res.data.role === "admin") {
          navigate("/homeadmin");
        } else if (res.data.role === "mentor") {
          navigate("/homementor");
        } else if (res.data.role === "mentee" && res.data.auth_gmail === "") {
          navigate("/homementee");
        } else {
          window.location.href = res.data.auth_gmail.toString();
        }
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Login Successful !",
          showConfirmButton: true,
        });
        reset();
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          text: "Invalid email or password",
        });
        if (err.response?.status === 500) {
          Swal.fire({
            icon: "error",
            text: "Something Error In Server",
          });
        }
      })
      .finally(() => setLoading(false));
  };
  return (
    <div className="w-full h-screen overflow-auto flex flex-row bg-putih">
      <div className="hidden md:w-1/2 md:flex md:justify-center items-center bg-gradient-to-b from-[#202442] to-[#332B6A] rounded-r-[25px]">
        <img
          id="gbr-login"
          className="w-[85%] text-center"
          src={girl}
          alt="gambarLogin"
        />
      </div>
      <form
        onSubmit={handleSubmit(onHandleLogin)}
        className="w-full md:w-1/2 px-10 lg:px-28 py-28"
      >
        <h1 className="font-semibold text-4xl mb-10">Login to your account</h1>
        <div className="space-y-5  text-sidebar ">
          <div className="flex flex-col">
            <p className="font-semibold">Email</p>
            <CustomInput
              register={register}
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              id="input-email"
              name="email"
              category="Login"
              type="email"
              placeholder="example@gmail.com"
              error={errors.email?.message}
            />
          </div>
          <div className="flex flex-col mb-10">
            <p className="font-semibold">Password</p>
            <CustomInput
              register={register}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              id="input-password"
              name="password"
              category="Login"
              type="password"
              placeholder="********"
              error={errors.password?.message}
            />
          </div>
        </div>
        <div className="w-full">
          <button
            type="submit"
            id="btn-login"
            className="btn w-full pl-3 h-[3.4rem] bg-[#473E8B] rounded-[10px] mt-10 mb-3"
          >
            Login
          </button>
          <p className="text-gray-500 text-sm font-light text-center w-full">
            If you dont have an account, please contact&nbsp;
            <a
              id="link-admin"
              href="mailto:mentutor@gmail.com"
              className="font-medium text-[#26317C] cursor-pointer"
            >
              admin
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
