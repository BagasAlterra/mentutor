import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import { apiRequest } from "../../utils/apiRequest";
import Swal from "sweetalert2";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTitle } from "../../utils/useTitle";
import { useCookies } from "react-cookie";
import { useDispatch } from "react-redux";
import { handleAuth } from "../../utils/reducers/reducer";

const schema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Email is invalid")
    .min(8, "Email must be at least 6 characters")
    .max(75, "Email must not exceed 30 characters"),
  fullname: yup
    .string()
    .required("Fullname is required")
    .min(5, "Fullname is too short")
    .max(50, "Fullname is too long")
    .matches(/^(?=.*[A-Z])/, "Fullname must contain one uppercase"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(30, "Password must not exceed 30 characters")
    .matches(/^(?=.*[A-Z])/, "Password must contain one uppercase")
    .matches(/^(?=.*[0-9])/, "Password must contain one number")
    .matches(
      /^(?=.*[!@#\$%\^&\*])/,
      "Password must contain one special character"
    ),
  role: yup.string().required("Role is required"),
  classname: yup.string().required("Class is required"),
});

const InputMember = () => {
  useTitle("List Members");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [datas, setDatas] = useState([]);
  const [className, setClassName] = useState("");
  const [password, setPassword] = useState("");
  const [cookie, setCookie, removeCookie] = useCookies();
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (fullName && email && role && className && password) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [fullName, email, role, className, password]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    apiRequest("admin/classes", "get", {})
      .then((res) => {
        const results = res.data;
        setDatas(results);
      })
      .catch((err) => {
        const data = err.response;
        if (err.response?.status === 401) {
          removeCookie("token");
          dispatch(handleAuth(false));
          navigate("/");
        }
        alert("Please re-login !");
      })
      .then(() => {
        setLoading(false);
      });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleRegister = async (data) => {
    const body = {
      name: fullName,
      email,
      role,
      id_class: className,
      password,
    };
    apiRequest("admin/users", "post", body)
      .then((res) => {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Register Success",
          showConfirmButton: true,
        });
        navigate("/homeadmin");
      })
      .catch((err) => {
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Invalid Input From Client",
          showConfirmButton: true,
        });
        if (err.response?.status === 500) {
          Swal.fire({
            position: "center",
            icon: "error",
            title: "Something Error In Server",
            showConfirmButton: true,
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Layout>
      <div className="pb-9">
        <div className="md:space-y-1 mb-[3rem]">
          <h1 className="text-putih text-lg md:text-2xl font-medium">
            Add Member
          </h1>
          <p className="text-abu font-light text-[8px] md:text-sm ">
            Join the class to learn with each others.
          </p>
        </div>

        <form
          className="w-full lg:w-[35rem] h-auto  bg-card rounded-[20px] text-xs md:text-lg p-5 md:p-10 "
          onSubmit={handleSubmit(handleRegister)}
        >
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2 w-full">
              <p className="text-putih text-md md:text-lg">Name</p>
              <CustomInput
                id="input-fullname"
                category="Class"
                type="text"
                placeholder="Full name"
                onChange={(e) => setFullName(e.target.value)}
                value={fullName}
                register={register}
                error={errors.fullname?.message}
                name="fullname"
              />
            </div>
            <div className="flex flex-col space-y-2 w-full">
              <h1 className="text-putih text-md md:text-lg">Email</h1>
              <CustomInput
                id="input-email"
                category="Class"
                type="text"
                placeholder="example@gmail.com"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                register={register}
                error={errors.email?.message}
                name="email"
              />
            </div>
            <div className="flex flex-row space-x-4">
              <div className="w-1/2 flex flex-col space-y-2 ">
                <h1 className="text-putih text-md md:text-lg">Role</h1>
                <label htmlFor="dropdown-role" className="sr-only"></label>
                <select
                  id="dropdown-role"
                  className="capitalize border placeholder:text-abu text-xs text-putih focus:outline-none focus:border-putih border-abu font-light rounded-[10px] bg-card w-full pl-3 h-[3.4rem]"
                  onChange={(e) => setRole(e.target.value)}
                  {...register("role", {
                    onChange: (e) => setRole(e.target.value),
                  })}
                  value={role}
                  name="role"
                >
                  <option value="" disabled>
                    Choose a role
                  </option>
                  <option value="mentor" id="mentor">
                    mentor
                  </option>
                  <option value="mentee" id="mentee">
                    mentee
                  </option>
                </select>
                <p className="break-words mt-1 text-xs font-normal text-red-500">
                  {errors.role?.message}
                </p>
              </div>
              <div className="w-1/2 flex flex-col space-y-2 ">
                <p className="text-putih text-md md:text-lg">Class</p>
                <label htmlFor="dropdown-class" className="sr-only"></label>
                <select
                  id="dropdown-class"
                  className="border capitalize placeholder:text-abu text-xs text-putih focus:outline-none focus:border-putih border-abu font-light rounded-[10px] bg-card w-full pl-3 h-[3.4rem]"
                  onChange={(e) => setClassName(parseFloat(e.target.value))}
                  {...register("classname", {
                    onChange: (e) => setClassName(parseFloat(e.target.value)),
                  })}
                  value={className}
                  name="classname"
                >
                  <option value="" disabled>
                    Choose a class
                  </option>
                  {datas.map((data) => (
                    <option key={data.id_class} value={data.id_class}>
                      {data.class_name}
                    </option>
                  ))}
                </select>
                <p className="break-words mt-1 text-xs font-normal text-red-500">
                  {errors.classname?.message}
                </p>
              </div>
            </div>
            <div className="flex flex-col space-y-2 w-full">
              <p className="text-putih text-md md:text-lg">Password</p>
              <CustomInput
                id="input-password"
                category="Class"
                type="password"
                placeholder="********"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                register={register}
                error={errors.password?.message}
                name="password"
              />
            </div>
          </div>
          <div className="text-end mt-5">
            <CustomButton id="btn-addMember" color="Primary" label="Add" />
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default InputMember;
