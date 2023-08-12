import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from './ui/button';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export default function Login() {
  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (res) => {
      const user = await axios.post(
        'http://localhost:7764/api/v1/users/login',
        {
          data: res,
        },
        { withCredentials: false }
      );

      console.log(user);
    },
    onError: (errorResponse) => console.log(errorResponse),
  });
  return (
    <section className="grid place-items-center h-screen pb-20">
      <Card className="">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent className="-mt-2">
          <p>We use your google account for authentication.</p>
          <p className="text-sm text-slate-500 pt-2">
            Creation of account is also handled
          </p>
        </CardContent>
        <CardFooter>
          <Button className="-mt-2" onClick={googleLogin}>
            Sign in with Google
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
